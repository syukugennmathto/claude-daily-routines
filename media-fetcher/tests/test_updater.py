import pytest

from app.updater import BUNDLED, Diagnosis, Updater, UpdateError
from conftest import run


def make_installer(versions):
    """呼ばれるたびに versions の先頭の版を「導入」する偽インストーラー。"""
    calls = []

    async def installer(target, channel):
        calls.append(channel)
        v = versions.pop(0)
        if isinstance(v, Exception):
            raise v
        (target / "yt_dlp").mkdir(parents=True)
        (target / "yt_dlp" / "version.py").write_text(f"__version__ = '{v}'\n")
        return v

    return installer, calls


def diag_by_version(up_ref, results):
    """現在使用中の版に応じて自己診断の合否を返す。"""
    async def diagnose():
        ok = results.get(up_ref[0].state["current"], True)
        return Diagnosis(ok, "" if ok else "YouTube: 仕様変更の疑い")
    return diagnose


def make(tmp_path, db, versions, results=None):
    installer, calls = make_installer(list(versions))
    ref = []
    up = Updater(tmp_path / "ytdlp", db, installer=installer, diagnose=diag_by_version(ref, results or {}))
    ref.append(up)
    return up, calls


def test_starts_on_bundled_version(tmp_path, db):
    up, _ = make(tmp_path, db, [])
    assert up.state["current"] == BUNDLED and up.current_path() is None and up.state["channel"] == "stable"


def test_update_keeps_previous_version(tmp_path, db):
    up, calls = make(tmp_path, db, ["2026.01.01", "2026.02.01"])
    r = run(up.update())
    assert r["ok"] and up.state["current"] == "2026.01.01" and up.state["previous"] == BUNDLED
    assert up.current_path().endswith("versions/2026.01.01")
    run(up.update())
    assert up.state["current"] == "2026.02.01" and up.state["previous"] == "2026.01.01"
    assert (tmp_path / "ytdlp/versions/2026.01.01").is_dir()      # 前の版を保持している
    assert calls == ["stable", "stable"]


def test_failed_self_test_rolls_back_automatically(tmp_path, db):
    up, _ = make(tmp_path, db, ["2026.01.01", "2026.02.01"], results={"2026.02.01": False})
    run(up.update())
    r = run(up.update())
    assert r["action"] == "auto_rollback" and not r["ok"]
    assert up.state["current"] == "2026.01.01"                    # 前の版に戻っている
    assert "2026.02.01" in up.state["bad"]
    assert "自動で戻しました" in r["message"]
    assert db.recent_updates(1)[0]["action"] == "auto_rollback"


def test_bad_version_is_not_reinstalled_automatically_but_manual_update_can_force(tmp_path, db):
    up, _ = make(tmp_path, db, ["2026.01.01", "2026.02.01", "2026.02.01", "2026.02.01"], results={"2026.02.01": False})
    run(up.update())
    run(up.update())
    r = run(up.update())
    assert r["action"] == "check" and up.state["current"] == "2026.01.01"
    r = run(up.update(manual=True))
    assert r["action"] == "auto_rollback" and up.state["current"] == "2026.01.01"


def test_no_rollback_when_old_version_fails_too(tmp_path, db):
    """新旧どちらでも失敗するなら更新が原因ではない（回線断など）ので、新版を維持する。"""
    up, _ = make(tmp_path, db, ["2026.01.01"], results={BUNDLED: False, "2026.01.01": False})
    r = run(up.update())
    assert r["ok"] and r["action"] == "update"
    assert up.state["current"] == "2026.01.01" and up.state["previous"] == BUNDLED
    assert up.state["bad"] == []


def test_install_failure_changes_nothing(tmp_path, db):
    up, _ = make(tmp_path, db, ["2026.01.01", UpdateError("pip install に失敗しました")])
    run(up.update())
    r = run(up.update())
    assert not r["ok"] and up.state["current"] == "2026.01.01"
    assert not list((tmp_path / "ytdlp/versions").glob(".tmp-*"))


def test_already_latest(tmp_path, db):
    up, _ = make(tmp_path, db, ["2026.01.01", "2026.01.01"])
    run(up.update())
    r = run(up.update())
    assert r["action"] == "check" and "最新" in r["message"]


def test_manual_rollback_and_back_again(tmp_path, db):
    up, _ = make(tmp_path, db, ["2026.01.01", "2026.02.01"])
    run(up.update())
    run(up.update())
    r = run(up.rollback())
    assert r["ok"] and up.state["current"] == "2026.01.01" and up.state["previous"] == "2026.02.01"
    run(up.rollback())
    assert up.state["current"] == "2026.02.01"


def test_rollback_without_previous(tmp_path, db):
    up, _ = make(tmp_path, db, [])
    assert not run(up.rollback())["ok"]


def test_channel_switch_and_state_persists(tmp_path, db):
    up, calls = make(tmp_path, db, ["2026.03.01.232800.dev0"])
    run(up.set_channel("nightly"))
    assert calls == ["nightly"] and up.state["channel"] == "nightly"
    again, _ = make(tmp_path, db, [])
    assert again.state["current"] == "2026.03.01.232800.dev0" and again.state["channel"] == "nightly"
    with pytest.raises(UpdateError):
        run(up.set_channel("beta"))


def test_old_versions_are_pruned(tmp_path, db):
    up, _ = make(tmp_path, db, ["1", "2", "3"])
    for _ in range(3):
        run(up.update())
    assert sorted(p.name for p in (tmp_path / "ytdlp/versions").iterdir()) == ["2", "3"]

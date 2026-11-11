import asyncio
import time

import pytest

from app import error_rules as er
from app import jobs as jb
from app.downloader.base import DownloadFailed
from app.jobs import CONVERTING, DONE, DOWNLOADING, FAILED, QUEUED, JobManager, backoff_delay, can_transition
from conftest import COOKIE_OK, FakeDownloader, run

URL = "https://www.youtube.com/watch?v=test"


async def no_sleep(_):
    return None


def manager(settings, db, lm, dl):
    return JobManager(settings, db, lm, {"ytdlp": dl}, sleep=no_sleep)


def add(db, **kw):
    fields = dict(url=URL, site="youtube", kind="mp3", quality="192")
    fields.update(kw)
    return db.add_job(**fields)


def run_next(m):
    job = m.db.claim_next_job(now=time.time() + 10**7)   # 再試行待ちの時刻を無視して取り出す
    assert job is not None
    run(m.run_job(job))
    return m.db.get_job(job["id"])


# ---- 状態遷移 ----
def test_transition_table():
    ok = [(QUEUED, DOWNLOADING), (DOWNLOADING, CONVERTING), (CONVERTING, DONE), (DOWNLOADING, FAILED),
          (CONVERTING, FAILED), (DOWNLOADING, QUEUED), (FAILED, QUEUED)]
    ng = [(QUEUED, DONE), (QUEUED, CONVERTING), (DONE, QUEUED), (DONE, FAILED), (FAILED, DONE), (CONVERTING, DOWNLOADING)]
    assert all(can_transition(a, b) for a, b in ok)
    assert not any(can_transition(a, b) for a, b in ng)


def test_invalid_transition_is_refused(settings, db, lm, media):
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4"))
    jid = add(db)
    with pytest.raises(jb.InvalidTransition):
        m._transition(jid, DONE)


@pytest.mark.parametrize("kind,quality,ext", [("mp3", "192", "mp3"), ("wav", "", "wav"), ("mp4", "720", "mp4")])
def test_job_runs_through_all_states(settings, db, lm, media, kind, quality, ext):
    dl = FakeDownloader(media / "h264.mp4", title="日本語のタイトル/テスト")
    m = manager(settings, db, lm, dl)
    states = []
    orig = m._transition
    m._transition = lambda jid, new, **f: (states.append(new), orig(jid, new, **f))[1]
    jid = add(db, kind=kind, quality=quality)
    job = db.claim_next_job()
    assert job["state"] == DOWNLOADING and job["attempts"] == 1
    run(m.run_job(job))
    job = db.get_job(jid)
    assert states == [CONVERTING, DONE] and job["state"] == DONE and job["progress"] == 100
    assert job["file_name"] == f"日本語のタイトル_テスト.{ext}"
    out = settings.downloads_dir / str(jid) / job["file_name"]
    assert out.is_file() and job["file_size"] == out.stat().st_size > 0
    assert job["used_login"] == 0 and job["reencode"] == 0
    # 見積もり値と実測値の両方が保存されている
    assert job["est_fetch"] is not None and job["act_fetch"] is not None and job["act_convert"] is not None
    assert job["expires_at"] == pytest.approx(time.time() + 7 * 86400, abs=60)
    assert not (settings.work_dir / f"job-{jid}").exists()          # 作業用ファイルは片付ける
    pub = m.public_job(job)
    assert pub["state_label"] == "完了" and pub["login_label"] == "ログインなし" and pub["download_url"]
    assert "file_path" not in pub


def test_non_h264_source_is_reencoded_and_flagged(settings, db, lm, media):
    m = manager(settings, db, lm, FakeDownloader(media / "vp9.webm"))
    add(db, kind="mp4", quality="best")
    job = run_next(m)
    assert job["state"] == DONE and job["reencode"] == 1 and "再エンコード" in job["format_note"]
    assert db.recent_samples("conv_rate", "mp4_reencode")


def test_measurements_feed_back_into_rates(settings, db, lm, media):
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4"))
    before = m.rates("youtube")
    assert not before.learned["mp3"]
    add(db)
    run_next(m)
    after = m.rates("youtube")
    assert after.learned["mp3"] and after.overhead_s == pytest.approx(0.1)
    for v in (10e6, 20e6, 30e6, 40e6, 50e6, 60e6):
        db.add_sample("dl_speed", "youtube", v)
    assert m.rates("youtube").download_bps == pytest.approx(40e6)   # 直近5件の移動平均
    assert not m.rates("niconico").learned["download"]             # サイト別


# ---- 失敗と再試行 ----
def test_retryable_error_backs_off_exponentially_up_to_three_times(settings, db, lm, media):
    err = lambda: DownloadFailed("Unable to download webpage: The read operation timed out", "TransportError")
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4", script=[err() for _ in range(4)]))
    jid = add(db)
    delays = []
    for _ in range(3):
        job = run_next(m)
        assert job["state"] == QUEUED and job["error_category"] == er.NETWORK
        delays.append(job["next_attempt_at"] - time.time())
        assert m.public_job(job)["state_label"] == "再試行待ち" and m.public_job(job)["error"]["will_retry"]
    assert 25 < delays[0] < 40 and 50 < delays[1] < 75 and 105 < delays[2] < 150     # 30 → 60 → 120 秒
    assert db.claim_next_job() is None                               # 待機時間が来るまでは実行されない
    job = run_next(m)
    assert job["state"] == FAILED and job["attempts"] == 4           # 初回 ＋ 再試行3回で打ち切り
    assert db.get_job(jid)["next_attempt_at"] is None


def test_backoff_delay():
    assert [backoff_delay(n, 30) for n in (1, 2, 3)] == [30, 60, 120]


def test_bot_block_waits_longer_and_shows_next_retry(settings, db, lm, media):
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4", script=[
        DownloadFailed("Sign in to confirm you're not a bot", "ExtractorError")]))
    add(db)
    job = run_next(m)
    assert job["state"] == QUEUED and job["error_category"] == er.BOT_BLOCK
    assert job["next_attempt_at"] - time.time() > 500
    assert m.public_job(job)["error"]["action"] == er.ACTION_AUTO_RETRY


@pytest.mark.parametrize("message,category", [
    ("Private video", er.PRIVATE_DELETED), ("not available in your country", er.GEO),
    ("This video is DRM protected", er.PAID_DRM), ("Premieres in 2 hours", er.LIVE),
])
def test_permanent_errors_fail_immediately(settings, db, lm, media, message, category):
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4", script=[DownloadFailed(message, "ExtractorError")]))
    add(db)
    job = run_next(m)
    assert job["state"] == FAILED and job["attempts"] == 1 and job["error_category"] == category
    err = m.public_job(job)["error"]
    assert err["reason"] and err["detail"] == message and "action" in err    # 理由・次にできること・詳細


def test_recovered_error_clears_after_success(settings, db, lm, media):
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4", script=[
        DownloadFailed("HTTP Error 503: Service Unavailable", "HTTPError")]))
    add(db)
    run_next(m)
    job = run_next(m)
    assert job["state"] == DONE and job["error_category"] is None and job["attempts"] == 2


def test_conversion_failure_shows_ffmpeg_log(settings, db, lm, tmp_path):
    broken = tmp_path / "broken.mp4"
    broken.write_bytes(b"this is not a media file")
    m = manager(settings, db, lm, FakeDownloader(broken))
    add(db)
    job = run_next(m)
    assert job["state"] == FAILED and job["error_category"] == er.CONVERT_FAILED
    assert "ffmpeg ログ末尾" in job["error_detail"]


def test_disk_full_reports_free_and_needed(settings, db, lm, media, monkeypatch):
    import collections
    usage = collections.namedtuple("usage", "total used free")
    monkeypatch.setattr(jb.shutil, "disk_usage", lambda p: usage(10**9, 10**9, 50 * 1024 * 1024))
    dl = FakeDownloader(media / "h264.mp4")
    m = manager(settings, db, lm, dl)
    add(db, est_source_bytes=500 * 1024 * 1024, est_output_bytes=100 * 1024 * 1024)
    job = run_next(m)
    assert job["state"] == FAILED and job["error_category"] == er.DISK_FULL and not dl.calls
    reason = m.public_job(job)["error"]["reason"]
    assert "空き 50.0MB" in reason and "必要 800MB" in reason


# ---- ログイン ----
def test_login_is_retried_automatically_and_recorded(settings, db, lm, media):
    lm.save_cookie("youtube", COOKIE_OK)
    dl = FakeDownloader(media / "h264.mp4", script=[
        DownloadFailed("Sign in to confirm your age", "ExtractorError")])
    m = manager(settings, db, lm, dl)
    add(db)
    job = run_next(m)
    assert [c["login"] for c in dl.calls] == [False, True]
    assert job["state"] == DONE and job["used_login"] == 1 and job["attempts"] == 1
    assert m.public_job(job)["login_label"] == "ログインあり"


def test_login_required_without_cookie_guides_to_settings(settings, db, lm, media):
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4", script=[
        DownloadFailed("Sign in to confirm your age", "ExtractorError")]))
    add(db)
    job = run_next(m)
    err = m.public_job(job)["error"]
    assert job["state"] == FAILED and err["category"] == er.LOGIN_REQUIRED
    assert err["action"] == er.ACTION_LOGIN_RETRY and err["login_available"] is False


def test_expired_cookie_is_reported_in_job_and_banner(settings, db, lm, media):
    lm.save_cookie("youtube", COOKIE_OK)
    age = lambda: DownloadFailed("Sign in to confirm your age", "ExtractorError")
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4", script=[age(), age()]))
    add(db)
    job = run_next(m)
    assert job["state"] == FAILED and job["error_category"] == er.COOKIE_EXPIRED and job["used_login"] == 1
    assert job["error_reason"] == "Cookie期限切れ：再設定してください。"
    assert m.list_public()["banners"][0]["message"] == "YouTube：Cookie期限切れ：再設定してください"


def test_manual_retry_with_login(settings, db, lm, media):
    lm.save_cookie("youtube", COOKIE_OK)
    lm.set_mode("youtube", "on_failure")
    dl = FakeDownloader(media / "h264.mp4", script=[DownloadFailed("Private video", "ExtractorError")])
    m = manager(settings, db, lm, dl)
    jid = add(db)
    assert run_next(m)["state"] == FAILED
    run(m.retry(jid, use_login=True))
    job = db.get_job(jid)
    assert job["state"] == QUEUED and job["attempts"] == 0 and job["error_category"] is None and job["force_login"] == 1
    assert run_next(m)["state"] == DONE and dl.calls[-1]["login"] is True
    with pytest.raises(jb.InvalidTransition):
        run(m.retry(jid))                                            # 完了したジョブは再試行できない


def test_secrets_never_reach_error_detail(settings, db, lm, media):
    settings.niconico_username, settings.niconico_password = "me@example.com", "pw-very-secret"
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4", script=[
        DownloadFailed("boom pw-very-secret me@example.com Cookie: user_session=abc123", "ValueError")]))
    add(db, site="niconico", url="https://www.nicovideo.jp/watch/sm1")
    detail = run_next(m)["error_detail"]
    assert "pw-very-secret" not in detail and "me@example.com" not in detail and "abc123" not in detail


# ---- 永続化・キュー ----
def test_queue_survives_restart(settings, db, lm, media):
    a, b = add(db), add(db)
    db.claim_next_job()                                              # a を実行中にしたまま「落ちる」
    db.close()
    from app.db import DB
    db2 = DB(settings.db_path)
    m = manager(settings, db2, lm.__class__(settings, db2), FakeDownloader(media / "h264.mp4"))
    (settings.work_dir / "job-1").mkdir()
    assert m.recover() == 1
    jobs = {j["id"]: j for j in db2.list_jobs()}
    assert jobs[a]["state"] == QUEUED and jobs[a]["attempts"] == 0 and jobs[b]["state"] == QUEUED
    assert not (settings.work_dir / "job-1").exists()
    assert db2.claim_next_job()["id"] == a                           # 元の順番で再開する
    db2.close()


def test_worker_processes_queue_in_background(settings, db, lm, media):
    async def scenario():
        m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4"))
        ids = [add(db), add(db, kind="wav", quality="")]
        m.start()
        for _ in range(200):
            await asyncio.sleep(0.05)
            if all(db.get_job(i)["state"] == DONE for i in ids):
                break
        await m.stop()
        return [db.get_job(i)["state"] for i in ids]
    assert run(scenario()) == [DONE, DONE]


def test_concurrency_is_one_by_default_and_capped_at_two(settings, db, lm, media):
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4"))
    assert m.concurrency() == 1
    m.set_concurrency(2)
    assert m.concurrency() == 2
    with pytest.raises(ValueError):
        m.set_concurrency(3)


def test_delete_removes_files_and_cleanup_expires_old_jobs(settings, db, lm, media):
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4"))
    a, b = add(db), add(db)
    run_next(m), run_next(m)
    assert m.delete(a) and db.get_job(a) is None and not (settings.downloads_dir / str(a)).exists()
    assert m.cleanup() == 0
    db.update_job(b, expires_at=time.time() - 1)
    assert m.cleanup() == 1 and db.get_job(b) is None and not (settings.downloads_dir / str(b)).exists()


# ---- プレビュー・追加 ----
def test_preview_lists_every_format_with_size_and_time(settings, db, lm, media, monkeypatch):
    monkeypatch.setattr(jb, "validate_url", lambda u, resolve=False: u)
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4", duration=240))
    p = run(m.preview(URL))
    assert p["ok"] and p["title"] == "テスト動画" and p["duration"] == 240 and p["thumbnail"]
    assert [o["key"] for o in p["options"]] == ["mp3:128", "mp3:192", "mp3:320", "wav", "mp4:best", "mp4:1080", "mp4:720", "mp4:480"]
    assert all(o["time_text"].startswith("約") and o["size_text"] for o in p["options"])
    ids = run(m.create_jobs(URL, "mp3", "320", token=p["token"]))
    job = db.get_job(ids[0])
    assert job["title"] == "テスト動画" and job["est_output_bytes"] == 320_000 // 8 * 240 and job["est_basis"] == "filesize"


def test_preview_reports_reason_before_adding(settings, db, lm, media, monkeypatch):
    monkeypatch.setattr(jb, "validate_url", lambda u, resolve=False: u)
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4", script=[
        DownloadFailed("This video is DRM protected", "ExtractorError")]))
    p = run(m.preview(URL))
    assert not p["ok"] and p["error"]["category"] == er.PAID_DRM and p["error"]["detail"]
    assert not db.list_jobs()


def test_preview_rejects_local_urls(settings, db, lm, media):
    dl = FakeDownloader(media / "h264.mp4")
    p = run(manager(settings, db, lm, dl).preview("http://192.168.0.1/video"))
    assert not p["ok"] and p["error"]["category"] == "invalid_url" and not dl.calls


def test_wait_time_adds_up_queue_and_gaps(settings, db, lm, media):
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4"))
    add(db, est_fetch=40, est_convert=20)
    add(db, est_fetch=10, est_convert=5)
    gap = (settings.job_gap_min + settings.job_gap_max) / 2
    assert m.wait_before() == pytest.approx(60 + 15 + gap * 2)
    assert m.wait_before(job_id=2) == pytest.approx(60 + gap)


def test_playlist_is_single_by_default_and_capped_at_twenty(settings, db, lm, media, monkeypatch):
    monkeypatch.setattr(jb, "validate_url", lambda u, resolve=False: u)
    m = manager(settings, db, lm, FakeDownloader(media / "h264.mp4"))
    assert len(run(m.create_jobs(URL, "mp3", "192"))) == 1
    p = run(m.preview(URL, playlist_all=True))
    assert p["playlist"] and p["count"] == 20 and all("目安" in o["time_text"] or o["time_text"] for o in p["options"])
    ids = run(m.create_jobs(URL, "mp3", "192", token=p["token"], playlist_all=True))
    assert len(ids) == 20

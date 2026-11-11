import os
import stat
import time

import pytest
from fastapi.testclient import TestClient

from app.downloader.base import DownloadFailed
from app.main import _parse_range, create_app
from conftest import COOKIE_OK, TOKEN, FakeDownloader, run

H = {"X-App": "1"}


@pytest.fixture
def client(settings, media):
    app = create_app(settings, downloader=FakeDownloader(media / "h264.mp4", title="日本語の曲"), background=False)
    with TestClient(app, follow_redirects=False) as c:
        c.core = app.state.core
        yield c


@pytest.fixture
def authed(client):
    assert client.post("/api/login", json={"token": TOKEN}, headers=H).status_code == 200
    return client


def finished_job(c):
    jid = c.core.db.add_job(url="https://www.youtube.com/watch?v=x", site="youtube", kind="mp3", quality="192")
    run(c.core.jobs.run_job(c.core.db.claim_next_job()))
    return jid


def test_app_refuses_to_start_without_a_real_token(settings):
    for bad in ("", "change-me", "short"):
        settings.app_token = bad
        with pytest.raises(SystemExit):
            create_app(settings, background=False)


def test_everything_requires_authentication(client):
    assert client.get("/api/jobs").status_code == 401
    assert client.get("/api/admin/status").status_code == 401
    assert client.post("/api/preview", json={"url": "https://example.com"}, headers=H).status_code == 401
    assert client.get("/api/jobs/1/file").status_code == 401
    r = client.get("/admin")
    assert r.status_code == 303 and r.headers["location"] == "/login?next=%2Fadmin"
    assert client.get("/login").status_code == 200 and client.get("/manifest.json").status_code == 200


def test_login_with_wrong_token_is_rejected_and_throttled(client, monkeypatch):
    import app.main as main

    async def no_sleep(_):
        return None
    monkeypatch.setattr(main.asyncio, "sleep", no_sleep)
    for _ in range(10):
        assert client.post("/api/login", json={"token": "wrong"}, headers=H).status_code == 401
    assert client.post("/api/login", json={"token": TOKEN}, headers=H).status_code == 429


def test_login_cookie_and_bearer_token(authed, client):
    cookie = authed.cookies.get("mf_auth")
    assert cookie and TOKEN not in cookie                       # トークンそのものは Cookie に入れない
    assert authed.get("/api/jobs").status_code == 200
    authed.cookies.clear()
    assert authed.get("/api/jobs").status_code == 401
    assert authed.get("/api/jobs", headers={"Authorization": f"Bearer {TOKEN}"}).status_code == 200


def test_state_changing_requests_need_the_custom_header(authed):
    assert authed.post("/api/jobs", json={"url": "https://www.youtube.com/watch?v=x", "kind": "mp3"}).status_code == 403
    assert authed.delete("/api/jobs/1").status_code == 403


def test_security_headers(authed):
    r = authed.get("/")
    assert r.headers["x-frame-options"] == "DENY" and "default-src 'self'" in r.headers["content-security-policy"]
    assert authed.get("/api/jobs").headers["cache-control"] == "no-store"


def test_static_path_traversal_is_blocked(authed):
    assert authed.get("/static/..%2Fmain.py").status_code == 404
    assert authed.get("/static/%2e%2e/config.py").status_code in (401, 404)
    assert authed.get("/static/style.css").status_code == 200


def test_bad_job_requests(authed):
    post = lambda **b: authed.post("/api/jobs", json=b, headers=H)
    assert post(url="file:///etc/passwd", kind="mp3").status_code == 400
    assert post(url="http://127.0.0.1/x", kind="mp3").status_code == 400
    assert post(url="https://8.8.8.8/x", kind="flac").status_code == 400
    assert post(url="https://8.8.8.8/x", kind="mp4", quality="4k").status_code == 400
    assert authed.post("/api/jobs/999/retry", headers=H).status_code == 404
    assert authed.delete("/api/jobs/999", headers=H).status_code == 404


def test_add_list_and_delete_job(authed):
    r = authed.post("/api/jobs", json={"url": "https://8.8.8.8/v", "kind": "mp4", "quality": "720"}, headers=H)
    assert r.status_code == 200
    jid = r.json()["ids"][0]
    job = authed.get("/api/jobs").json()["jobs"][0]
    assert job["id"] == jid and job["state_label"] == "待機" and job["preset_label"] == "MP4 720p"
    assert authed.delete(f"/api/jobs/{jid}", headers=H).status_code == 200
    assert authed.get("/api/jobs").json()["jobs"] == []


def test_download_has_japanese_filename_and_supports_range(authed):
    jid = finished_job(authed)
    url = f"/api/jobs/{jid}/file"
    full = authed.get(url)
    size = len(full.content)
    assert full.status_code == 200 and size > 1000
    cd = full.headers["content-disposition"]
    assert cd.startswith("attachment;") and "filename*=UTF-8''%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E6%9B%B2.mp3" in cd
    assert full.headers["accept-ranges"] == "bytes" and full.headers["content-length"] == str(size)
    assert full.headers["content-type"] == "audio/mpeg"

    part = authed.get(url, headers={"Range": "bytes=100-299"})
    assert part.status_code == 206 and part.content == full.content[100:300]
    assert part.headers["content-range"] == f"bytes 100-299/{size}" and part.headers["content-length"] == "200"
    rest = authed.get(url, headers={"Range": "bytes=300-"})          # 途中で切れたあとの再開
    assert rest.status_code == 206 and full.content[:100] + part.content[:0] + full.content[100:300] + rest.content == full.content
    tail = authed.get(url, headers={"Range": "bytes=-50"})
    assert tail.status_code == 206 and tail.content == full.content[-50:]
    bad = authed.get(url, headers={"Range": f"bytes={size + 10}-"})
    assert bad.status_code == 416 and bad.headers["content-range"] == f"bytes */{size}"
    stale = authed.get(url, headers={"Range": "bytes=0-9", "If-Range": '"other"'})
    assert stale.status_code == 200 and len(stale.content) == size   # ファイルが変わっていたら最初から
    head = authed.head(url)
    assert head.status_code == 200 and head.headers["content-length"] == str(size)


def test_parse_range():
    assert _parse_range(None, 100) is None
    assert _parse_range("bytes=0-", 100) == (0, 99)
    assert _parse_range("bytes=10-1000", 100) == (10, 99)
    assert _parse_range("bytes=-10", 100) == (90, 99)
    assert _parse_range("bytes=100-", 100) is False
    assert _parse_range("bytes=0-1,5-9", 100) is None
    assert _parse_range("items=0-1", 100) is None


def test_full_download_records_transfer_time(authed):
    jid = finished_job(authed)
    authed.get(f"/api/jobs/{jid}/file", headers={"Range": "bytes=0-9"})
    assert authed.core.db.get_job(jid)["act_transfer"] is None
    authed.get(f"/api/jobs/{jid}/file")
    assert authed.core.db.get_job(jid)["act_transfer"] is not None


def test_file_is_not_served_for_unfinished_or_missing_jobs(authed):
    jid = authed.core.db.add_job(url="https://example.com/a", site="generic", kind="mp3", quality="192")
    assert authed.get(f"/api/jobs/{jid}/file").status_code == 404
    done = finished_job(authed)
    authed.core.db.update_job(done, file_name="../../../config/app.db")
    assert authed.get(f"/api/jobs/{done}/file").status_code == 404   # 登録名が細工されていても外には出ない


def test_cookie_upload_from_phone(authed, settings):
    r = authed.put("/api/admin/cookies/youtube", content=COOKIE_OK, headers={**H, "Content-Type": "text/plain"})
    assert r.status_code == 200 and r.json()["status"] == "valid"
    path = settings.cookies_dir / "youtube.txt"
    assert stat.S_IMODE(os.stat(path).st_mode) == 0o600
    status = authed.get("/api/admin/status").json()
    yt = next(x for x in status["logins"] if x["site"] == "youtube")
    assert yt["status"] == "valid" and yt["mode"] == "on_failure" and yt["has_cookie"]
    assert "secretvalue" not in authed.get("/api/admin/status").text      # 中身は返さない
    assert authed.put("/api/admin/cookies/youtube", content="garbage", headers=H).status_code == 400
    assert authed.put("/api/admin/cookies/generic", content=COOKIE_OK, headers=H).status_code == 404
    assert authed.put("/api/admin/cookies/youtube", content="x" * (1024 * 1024 + 1), headers=H).status_code == 413
    assert authed.delete("/api/admin/cookies/youtube", headers=H).status_code == 200
    assert not path.exists()


def test_settings_login_mode_and_concurrency(authed):
    put = lambda body: authed.put("/api/admin/settings", json=body, headers=H).status_code
    assert put({"login_mode": {"youtube": "always"}, "concurrency": 2}) == 200
    s = authed.get("/api/admin/status").json()
    assert next(x for x in s["logins"] if x["site"] == "youtube")["mode"] == "always" and s["settings"]["concurrency"] == 2
    assert put({"login_mode": {"youtube": "sometimes"}}) == 400
    assert put({"concurrency": 5}) == 400


def test_share_target_extracts_the_url(authed):
    r = authed.get("/share", params={"title": "動画", "text": "見て https://youtu.be/abc123?si=x すごい"})
    assert r.status_code == 303 and r.headers["location"] == "/?share=https%3A%2F%2Fyoutu.be%2Fabc123%3Fsi%3Dx"
    assert authed.get("/share", params={"text": "URLなし"}).headers["location"] == "/"


def test_healthcheck_reports_cause_in_japanese(authed, settings):
    settings.health_url_youtube = "https://www.youtube.com/watch?v=health"
    authed.core.dl.script = [DownloadFailed("Unable to extract player response", "RegexNotFoundError")]
    r = authed.post("/api/admin/healthcheck", headers=H).json()
    assert not r["ok"] and r["sites"][0]["category"] == "site_change" and "更新" in r["sites"][0]["hint"]
    assert r["environment"]["deno"] and not r["environment"]["problems"]
    rep = authed.get("/api/admin/status").json()["health"]
    yt = next(s for s in rep["sites"] if s["site"] == "youtube")
    assert yt["configured"] and yt["result"]["ok"] == 0 and yt["login_status_label"] == "未設定"
    assert not next(s for s in rep["sites"] if s["site"] == "niconico")["configured"]
    ok = authed.post("/api/admin/healthcheck", headers=H).json()
    assert ok["ok"] and ok["sites"][0]["meta_ok"] and ok["sites"][0]["download_ok"]


def test_missing_deno_is_reported(authed):
    async def env(version_path=False):
        return {"ytdlp_version": "x", "deno": None, "deno_supported": False, "ejs": "1", "ffmpeg": True}
    authed.core.dl.environment = env
    r = authed.post("/api/admin/healthcheck", headers=H).json()
    assert not r["ok"] and any("Deno" in p for p in r["environment"]["problems"])


def test_accuracy_report_after_jobs(authed):
    jid = finished_job(authed)
    authed.core.db.update_job(jid, est_fetch=12.0, act_fetch=10.0, est_convert=5.0, act_convert=5.0, est_basis="filesize")
    acc = authed.get("/api/admin/status").json()["accuracy"]
    assert acc["fetch"] == {"count": 1, "mean_abs_pct": 20.0, "bias_pct": 20.0}

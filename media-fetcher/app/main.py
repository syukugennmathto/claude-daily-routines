"""FastAPI アプリ本体：認証、API、ファイル配信、定期処理。"""
from __future__ import annotations

import asyncio
import datetime as dt
import hashlib
import hmac
import logging
import os
import re
import shutil
import time
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import quote

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse, Response, StreamingResponse

from . import ffmpeg
from .config import LOGIN_MODES, Settings
from .db import DB
from .downloader.adapters import adapter, login_sites
from .downloader.base import DownloadFailed
from .downloader.ytdlp import YtDlpDownloader
from .healthcheck import HealthChecker
from .jobs import DONE, InvalidTransition, JobManager
from .login import CookieFileError, LoginManager
from .security import UrlRejected, content_disposition, safe_child
from .updater import CHANNELS, Updater, UpdateError, pip_installer

log = logging.getLogger("mediafetcher")
STATIC = Path(__file__).parent / "static"
AUTH_COOKIE = "mf_auth"
PUBLIC_PATHS = {"/login", "/api/login", "/manifest.json", "/sw.js", "/static/style.css", "/static/login.js",
                "/static/icon.svg", "/static/icon-192.png", "/static/icon-512.png", "/healthz"}
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' https: data:; style-src 'self'; "
                               "script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'",
}


class Core:
    """アプリの部品をまとめて持つ。テストでは downloader / installer を差し替える。"""

    def __init__(self, settings: Settings, downloader=None, installer=pip_installer):
        self.s = settings
        settings.ensure_dirs()
        self.db = DB(settings.db_path)
        try:
            os.chmod(settings.db_path, 0o600)
        except OSError:
            pass
        self.lm = LoginManager(settings, self.db)
        self.updater = Updater(settings.ytdlp_dir, self.db, default_channel=settings.ytdlp_channel, installer=installer)
        self.dl = downloader or YtDlpDownloader(
            settings.work_dir, settings.ytdlp_dir / "cache", version_path=self.updater.current_path,
            secrets=settings.secrets)
        self.health = HealthChecker(settings, self.db, self.dl, self.lm)
        self.updater.diagnose = self.health.diagnose
        self.jobs = JobManager(settings, self.db, self.lm, {"ytdlp": self.dl}, updater=self.updater)
        self.bg: list[asyncio.Task] = []
        self.busy: dict[str, bool] = {}
        self.auth_value = hmac.new(settings.app_token.encode(), b"media-fetcher-session", hashlib.sha256).hexdigest()
        self.login_failures: list[float] = []

    # ---- 定期処理 ----
    async def run_benchmark(self) -> dict:
        rates = await ffmpeg.benchmark(self.s.work_dir / "bench")
        for op, rate in rates.items():
            self.db.add_sample("conv_rate", op, rate)
        self.db.set_setting("benchmark", {"ran_at": time.time(), "rates": {k: round(v, 1) for k, v in rates.items()}})
        return rates

    async def maintenance(self, *, startup: bool = False) -> None:
        """更新 → 自己診断 → 掃除。起動時と毎日1回。"""
        try:
            self.jobs.cleanup()
            ran_diag = False
            if self.s.auto_update:
                r = await self.updater.update()
                ran_diag = r["action"] in ("update", "auto_rollback") and r["to"] is not None
                log.info("yt-dlp update: %s", r["message"])
            last = self.db.get_setting("health_last_run") or 0
            if not ran_diag and (not startup or time.time() - last > 20 * 3600):
                await self.health.run()
            elif startup:
                await self.health.check_environment()
        except Exception:
            log.exception("maintenance failed")

    async def _startup(self) -> None:
        env = await self.health.check_environment()
        for p in env["problems"]:
            log.warning("起動時チェック: %s", p)
        if env.get("deno"):
            log.info("Deno %s を認識しました（yt-dlp %s）", env["deno"], env.get("ytdlp_version"))
        if not self.db.has_samples("conv_rate"):
            try:
                log.info("初回ベンチマーク: %s", await self.run_benchmark())
            except Exception as e:
                log.warning("ベンチマークに失敗しました: %s", e)
        await self.maintenance(startup=True)

    async def _scheduler(self) -> None:
        await self._startup()
        last_hourly = time.time()
        while True:
            now = dt.datetime.now()
            nxt = now.replace(hour=self.s.daily_hour % 24, minute=7, second=0, microsecond=0)
            if nxt <= now:
                nxt += dt.timedelta(days=1)
            wait = min((nxt - now).total_seconds(), 3600)
            await asyncio.sleep(wait)
            if dt.datetime.now() >= nxt:
                await self.maintenance()
            elif time.time() - last_hourly >= 3500:
                last_hourly = time.time()
                try:
                    self.jobs.cleanup()
                except Exception:
                    log.exception("cleanup failed")

    def start(self) -> None:
        n = self.jobs.recover()
        if n:
            log.info("中断されていたジョブ %d 件をキューに戻しました", n)
        self.jobs.start()
        self.bg.append(asyncio.create_task(self._scheduler()))

    async def stop(self) -> None:
        for t in self.bg:
            t.cancel()
        await asyncio.gather(*self.bg, return_exceptions=True)
        await self.jobs.stop()
        self.db.close()

    async def exclusive(self, name: str, coro_fn):
        """更新・診断などの重い管理操作を二重に走らせない。"""
        if self.busy.get(name):
            raise HTTPException(409, "同じ操作が実行中です。しばらく待ってください。")
        self.busy[name] = True
        try:
            return await coro_fn()
        finally:
            self.busy[name] = False


def _parse_range(header: str | None, size: int) -> tuple[int, int] | None | bool:
    """Range ヘッダーを解釈する。None=全体、False=範囲不正、(start, end)=部分。"""
    if not header:
        return None
    m = re.fullmatch(r"bytes=(\d*)-(\d*)", header.strip())
    if not m or (not m.group(1) and not m.group(2)):
        return None          # 複数範囲などは全体を返す
    if not m.group(1):
        n = int(m.group(2))
        if n == 0:
            return False
        return max(0, size - n), size - 1
    start = int(m.group(1))
    end = int(m.group(2)) if m.group(2) else size - 1
    if start >= size or end < start:
        return False
    return start, min(end, size - 1)


def create_app(settings: Settings | None = None, *, downloader=None, installer=pip_installer,
               background: bool = True) -> FastAPI:
    settings = settings or Settings()
    problem = settings.token_problem()
    if problem:
        raise SystemExit(f"[設定エラー] {problem}")
    core = Core(settings, downloader, installer)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        if background:
            core.start()
        yield
        if background:
            await core.stop()

    app = FastAPI(title="media-fetcher", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
    app.state.core = core

    def authed(request: Request) -> bool:
        cookie = request.cookies.get(AUTH_COOKIE, "")
        if cookie and hmac.compare_digest(cookie, core.auth_value):
            return True
        h = request.headers.get("authorization", "")
        return h.startswith("Bearer ") and hmac.compare_digest(h[7:].strip().encode(), settings.app_token.encode())

    @app.middleware("http")
    async def guard(request: Request, call_next):
        path = request.url.path
        if path not in PUBLIC_PATHS and not authed(request):
            if path.startswith("/api/"):
                resp = JSONResponse({"detail": "認証が必要です。"}, status_code=401)
            else:
                nxt = path + (("?" + request.url.query) if request.url.query else "")
                resp = RedirectResponse("/login?next=" + quote(nxt, safe=""), status_code=303)
        elif (path.startswith("/api/") and request.method not in ("GET", "HEAD", "OPTIONS")
              and request.headers.get("x-app") != "1"):
            # ブラウザのフォーム送信では付けられないヘッダーを要求する（CSRF対策）
            resp = JSONResponse({"detail": "不正なリクエストです。"}, status_code=403)
        else:
            resp = await call_next(request)
        for k, v in SECURITY_HEADERS.items():
            resp.headers.setdefault(k, v)
        if path.startswith("/api/"):
            resp.headers.setdefault("Cache-Control", "no-store")
        return resp

    # ---------------------------------------------------------------- 画面
    def page(name: str) -> FileResponse:
        return FileResponse(STATIC / name, headers={"Cache-Control": "no-cache"})

    @app.get("/")
    async def index():
        return page("index.html")

    @app.get("/admin")
    async def admin_page():
        return page("admin.html")

    @app.get("/login")
    async def login_page():
        return page("login.html")

    @app.get("/manifest.json")
    async def manifest():
        return FileResponse(STATIC / "manifest.json", media_type="application/manifest+json")

    @app.get("/sw.js")
    async def sw():
        return FileResponse(STATIC / "sw.js", media_type="text/javascript",
                            headers={"Cache-Control": "no-cache", "Service-Worker-Allowed": "/"})

    @app.get("/static/{name}")
    async def static(name: str):
        try:
            path = safe_child(STATIC, name)
        except ValueError:
            raise HTTPException(404) from None
        if not path.is_file():
            raise HTTPException(404)
        return FileResponse(path, headers={"Cache-Control": "no-cache"})

    @app.get("/healthz")
    async def healthz():
        return {"ok": True}

    @app.get("/share")
    async def share(request: Request):
        """Web Share Target の受け口。共有された文面から URL を取り出して画面に渡す。"""
        q = request.query_params
        text = " ".join(v for v in (q.get("url"), q.get("text"), q.get("title")) if v)
        m = re.search(r"https?://[^\s<>\"']+", text)
        return RedirectResponse("/?share=" + quote(m.group(0), safe="") if m else "/", status_code=303)

    # ---------------------------------------------------------------- 認証
    @app.post("/api/login")
    async def api_login(request: Request):
        now = time.time()
        core.login_failures[:] = [t for t in core.login_failures if now - t < 600]
        if len(core.login_failures) >= 10:
            raise HTTPException(429, "試行回数が多すぎます。10分ほど待ってください。")
        body = await request.json()
        token = str(body.get("token") or "")
        if not hmac.compare_digest(token.encode(), settings.app_token.encode()):
            core.login_failures.append(now)
            await asyncio.sleep(1)
            raise HTTPException(401, "トークンが違います。")
        resp = JSONResponse({"ok": True})
        secure = settings.cookie_secure or request.url.scheme == "https" or \
            request.headers.get("x-forwarded-proto") == "https"
        resp.set_cookie(AUTH_COOKIE, core.auth_value, max_age=400 * 86400, httponly=True, samesite="lax",
                        secure=secure, path="/")
        return resp

    @app.post("/api/logout")
    async def api_logout():
        resp = JSONResponse({"ok": True})
        resp.delete_cookie(AUTH_COOKIE, path="/")
        return resp

    # ---------------------------------------------------------------- プレビュー・ジョブ
    @app.post("/api/preview")
    async def api_preview(request: Request):
        body = await request.json()
        return await core.jobs.preview(str(body.get("url") or ""), bool(body.get("playlist_all")))

    @app.post("/api/jobs")
    async def api_add_job(request: Request):
        body = await request.json()
        try:
            ids = await core.jobs.create_jobs(
                str(body.get("url") or ""), str(body.get("kind") or ""), body.get("quality"),
                token=body.get("token"), playlist_all=bool(body.get("playlist_all")),
                force_login=bool(body.get("use_login")))
        except (UrlRejected, ValueError) as e:
            raise HTTPException(400, str(e)) from None
        except DownloadFailed as e:
            raise HTTPException(400, "プレイリストを取得できませんでした：" + e.message[:300]) from None
        return {"ok": True, "ids": ids}

    @app.get("/api/jobs")
    async def api_jobs():
        return core.jobs.list_public()

    @app.post("/api/jobs/{job_id}/retry")
    async def api_retry(job_id: int, request: Request):
        body = await request.json() if int(request.headers.get("content-length") or 0) else {}
        try:
            return await core.jobs.retry(job_id, use_login=bool(body.get("use_login")),
                                         update_first=bool(body.get("update_first")))
        except KeyError:
            raise HTTPException(404, "ジョブが見つかりません。") from None
        except InvalidTransition as e:
            raise HTTPException(409, str(e)) from None

    @app.delete("/api/jobs/{job_id}")
    async def api_delete(job_id: int):
        if not core.jobs.delete(job_id):
            raise HTTPException(404, "ジョブが見つかりません。")
        return {"ok": True}

    @app.api_route("/api/jobs/{job_id}/file", methods=["GET", "HEAD"])
    async def api_file(job_id: int, request: Request):
        job = core.db.get_job(job_id)
        if not job or job["state"] != DONE or not job["file_name"]:
            raise HTTPException(404, "ファイルがありません。")
        try:
            path = safe_child(settings.downloads_dir / str(job_id), job["file_name"])
        except ValueError:
            raise HTTPException(404) from None
        if not path.is_file():
            raise HTTPException(404, "ファイルは保存期限切れなどで削除されました。")
        stat = path.stat()
        size = stat.st_size
        etag = f'"{job_id}-{size}-{int(stat.st_mtime)}"'
        mime = {"mp3": "audio/mpeg", "wav": "audio/wav", "mp4": "video/mp4"}.get(job["kind"], "application/octet-stream")
        headers = {"Accept-Ranges": "bytes", "Content-Disposition": content_disposition(job["file_name"]),
                   "ETag": etag, "Cache-Control": "private, no-transform", "X-Content-Type-Options": "nosniff"}
        rng = _parse_range(request.headers.get("range"), size)
        if_range = request.headers.get("if-range")
        if if_range and if_range != etag:
            rng = None
        if rng is False:
            return Response(status_code=416, headers={**headers, "Content-Range": f"bytes */{size}"})
        start, end = rng if rng else (0, size - 1)
        length = max(0, end - start + 1)
        headers["Content-Length"] = str(length)
        status = 200
        if rng:
            status = 206
            headers["Content-Range"] = f"bytes {start}-{end}/{size}"
        if request.method == "HEAD":
            return Response(status_code=status, headers=headers, media_type=mime)

        async def body():
            sent, t0 = 0, time.time()
            try:
                with open(path, "rb") as f:
                    f.seek(start)
                    while sent < length:
                        chunk = await asyncio.to_thread(f.read, min(256 * 1024, length - sent))
                        if not chunk:
                            break
                        yield chunk
                        sent += len(chunk)
            finally:
                # スマホへの転送速度を学習する（全体を最後まで送れたときは実測時間も記録）
                core.jobs.record_transfer(job_id, sent, time.time() - t0, complete=(rng is None and sent >= size))

        return StreamingResponse(body(), status_code=status, headers=headers, media_type=mime)

    # ---------------------------------------------------------------- 管理
    @app.get("/api/admin/status")
    async def api_status():
        usage = shutil.disk_usage(settings.downloads_dir)
        return {
            "ytdlp": core.updater.info(),
            "health": core.health.report(),
            "logins": core.lm.all_status(),
            "banners": core.lm.banners(),
            "accuracy": core.db.accuracy(),
            "rates": core.jobs.rates_report(),
            "benchmark": core.db.get_setting("benchmark"),
            "disk": {"free": usage.free, "total": usage.total},
            "settings": {"concurrency": core.jobs.concurrency(), "retention_days": settings.retention_days,
                         "auto_update": settings.auto_update, "daily_hour": settings.daily_hour,
                         "niconico_password_set": bool(settings.niconico_username and settings.niconico_password)},
            "busy": [k for k, v in core.busy.items() if v],
            "now": time.time(),
        }

    @app.post("/api/admin/update")
    async def api_update():
        return await core.exclusive("update", lambda: core.updater.update(manual=True))

    @app.post("/api/admin/channel")
    async def api_channel(request: Request):
        channel = str((await request.json()).get("channel") or "")
        if channel not in CHANNELS:
            raise HTTPException(400, "チャンネルは stable / nightly のどちらかです。")
        try:
            return await core.exclusive("update", lambda: core.updater.set_channel(channel))
        except UpdateError as e:
            raise HTTPException(400, str(e)) from None

    @app.post("/api/admin/rollback")
    async def api_rollback():
        return await core.exclusive("update", core.updater.rollback)

    @app.post("/api/admin/healthcheck")
    async def api_healthcheck():
        return await core.exclusive("health", core.health.run)

    @app.put("/api/admin/settings")
    async def api_settings(request: Request):
        body = await request.json()
        try:
            for site, mode in (body.get("login_mode") or {}).items():
                if mode not in LOGIN_MODES or site not in {a.key for a in login_sites()}:
                    raise ValueError("ログインモードの指定が正しくありません。")
                core.lm.set_mode(site, mode)
            if "concurrency" in body:
                core.jobs.set_concurrency(int(body["concurrency"]))
        except (ValueError, TypeError) as e:
            raise HTTPException(400, str(e)) from None
        return {"ok": True}

    @app.put("/api/admin/cookies/{site}")
    async def api_cookie_put(site: str, request: Request):
        if site not in {a.key for a in login_sites()}:
            raise HTTPException(404, "対象外のサイトです。")
        if int(request.headers.get("content-length") or 0) > 1024 * 1024:
            raise HTTPException(413, "ファイルが大きすぎます（1MBまで）。")
        raw = await request.body()
        if len(raw) > 1024 * 1024:
            raise HTTPException(413, "ファイルが大きすぎます（1MBまで）。")
        try:
            status, detail = core.lm.save_cookie(site, raw.decode("utf-8-sig", "replace"))
        except CookieFileError as e:
            raise HTTPException(400, str(e)) from None
        return {"ok": True, "status": status, "detail": detail, "label": adapter(site).label}

    @app.delete("/api/admin/cookies/{site}")
    async def api_cookie_delete(site: str):
        if site not in {a.key for a in login_sites()}:
            raise HTTPException(404, "対象外のサイトです。")
        core.lm.delete_cookie(site)
        return {"ok": True}

    @app.post("/api/admin/estimator/reset")
    async def api_est_reset():
        for kind in ("dl_speed", "overhead", "xfer_speed"):
            core.db.clear_samples(kind)
        return {"ok": True}

    @app.post("/api/admin/estimator/bench")
    async def api_bench():
        async def run():
            core.db.clear_samples("conv_rate")
            return {"ok": True, "rates": {k: round(v, 1) for k, v in (await core.run_benchmark()).items()}}
        try:
            return await core.exclusive("bench", run)
        except ffmpeg.FFmpegError as e:
            raise HTTPException(500, f"ベンチマークに失敗しました：{e}") from None

    return app


def app_factory() -> FastAPI:
    logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"), format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    return create_app()

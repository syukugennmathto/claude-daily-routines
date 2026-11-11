"""Downloader の yt-dlp 実装（親プロセス側）。実処理は ytdlp_runner を子プロセスで動かす。"""
from __future__ import annotations

import asyncio
import json
import os
import shutil
import signal
import sys
import tempfile
from dataclasses import asdict
from pathlib import Path
from typing import Callable

from ..formats import ALL_PRESETS, format_selector
from ..security import redact
from .adapters import adapter_for_url
from .base import (AuthContext, Cancelled, DownloadFailed, DownloadRequest, DownloadResult, Progress, ProbeResult,
                   SelfTestResult)

PROJECT_ROOT = str(Path(__file__).resolve().parents[2])
SELECTIONS = sorted({p.selection for p in ALL_PRESETS})


class YtDlpDownloader:
    name = "ytdlp"

    def __init__(self, work_dir: Path, cache_dir: Path | None = None,
                 version_path: Callable[[], str | None] = lambda: None,
                 secrets: Callable[[], list[str]] = lambda: []):
        self.work_dir = Path(work_dir)
        self.cache_dir = cache_dir
        self._version_path = version_path
        self._secrets = secrets

    # ---- 子プロセス実行 ----
    def _env(self, version_path: str | None) -> dict:
        env = {k: v for k, v in os.environ.items()
               if k not in ("APP_TOKEN", "NICONICO_PASSWORD", "NICONICO_USERNAME")}
        paths = [p for p in (version_path, PROJECT_ROOT) if p]
        env["PYTHONPATH"] = os.pathsep.join(paths)
        env["PYTHONUNBUFFERED"] = "1"
        return env

    async def _run(self, req: dict, *, auth: AuthContext | None = None, on_event=None, cancel_token=None,
                   timeout: float = 180, version_path: str | None | bool = False) -> dict:
        vp = self._version_path() if version_path is False else version_path
        req = dict(req)
        if self.cache_dir:
            req["cachedir"] = str(self.cache_dir)
        if "url" in req:
            req.setdefault("engine_options", adapter_for_url(req["url"]).engine_options)
        tmp_cookie = None
        hide = []
        if auth:
            a = asdict(auth)
            if auth.cookiefile:
                # yt-dlp は終了時に Cookie ファイルを書き戻す。原本を壊さないよう複製を渡す
                fd, tmp_cookie = tempfile.mkstemp(prefix="ck-", suffix=".txt", dir=self.work_dir)
                os.close(fd)
                os.chmod(tmp_cookie, 0o600)
                shutil.copyfile(auth.cookiefile, tmp_cookie)
                a["cookiefile"] = tmp_cookie
                hide = [tmp_cookie, auth.cookiefile]
            req["auth"] = a
        secrets = [*self._secrets(), *([auth.password] if auth and auth.password else []),
                   *([auth.username] if auth and auth.username else [])]

        def clean(s: str) -> str:
            return redact(s, secrets, hide)

        proc = await asyncio.create_subprocess_exec(
            sys.executable, "-m", "app.downloader.ytdlp_runner",
            stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
            cwd=PROJECT_ROOT, env=self._env(vp), start_new_session=True, limit=16 * 1024 * 1024)

        def kill():
            try:
                os.killpg(proc.pid, signal.SIGKILL)
            except (ProcessLookupError, PermissionError):
                pass

        async def pump():
            proc.stdin.write(json.dumps(req).encode())
            await proc.stdin.drain()
            proc.stdin.close()
            result = error = None
            async for line in proc.stdout:
                try:
                    ev = json.loads(line)
                except ValueError:
                    continue
                kind = ev.pop("event", None)
                if kind == "result":
                    result = ev
                elif kind == "error":
                    error = ev
                elif on_event:
                    r = on_event(kind, ev)
                    if asyncio.iscoroutine(r):
                        await r
            stderr = (await proc.stderr.read()).decode("utf-8", "replace")
            await proc.wait()
            return result, error, stderr

        task = asyncio.ensure_future(pump())
        waiters = [task]
        cancel_wait = None
        if cancel_token is not None:
            cancel_wait = asyncio.ensure_future(cancel_token.wait())
            waiters.append(cancel_wait)
        try:
            done, _ = await asyncio.wait(waiters, timeout=timeout, return_when=asyncio.FIRST_COMPLETED)
            if task not in done:
                kill()
                task.cancel()
                if cancel_wait is not None and cancel_wait in done:
                    raise Cancelled()
                raise DownloadFailed(f"Timed out after {int(timeout)} seconds", "TimeoutError")
            result, error, stderr = task.result()
        except asyncio.CancelledError:
            kill()
            task.cancel()
            raise
        finally:
            if cancel_wait is not None:
                cancel_wait.cancel()
            if tmp_cookie:
                try:
                    os.unlink(tmp_cookie)
                except OSError:
                    pass
        if error is not None:
            raise DownloadFailed(clean(error.get("message") or "unknown error"), error.get("exc_type") or "",
                                 category=error.get("category"), extra=error.get("extra") or {},
                                 warnings=[clean(w) for w in error.get("warnings") or []])
        if result is None:
            tail = "\n".join(stderr.strip().splitlines()[-15:])
            raise DownloadFailed(clean(f"yt-dlp process exited unexpectedly (code {proc.returncode})\n{tail}"),
                                 "RunnerCrashed")
        result["warnings"] = [clean(w) for w in result.get("warnings") or []]
        return result

    # ---- Downloader インターフェース ----
    async def probe(self, url: str, *, auth: AuthContext | None = None, playlist: bool = False,
                    playlist_limit: int = 20) -> ProbeResult:
        r = await self._run({"op": "probe", "url": url, "playlist": playlist, "playlist_limit": playlist_limit,
                             "selectors": {s: format_selector(s) for s in SELECTIONS}}, auth=auth, timeout=180)
        return ProbeResult(title=r.get("title") or "", duration=r.get("duration"), thumbnail=r.get("thumbnail"),
                           webpage_url=r.get("webpage_url") or url, selections=r.get("selections") or {},
                           playlist=r.get("playlist"), playlist_title=r.get("playlist_title"),
                           warnings=r["warnings"], seconds=r.get("seconds") or 0.0)

    async def download(self, req: DownloadRequest, on_progress=None, cancel_token=None) -> DownloadResult:
        total = {"v": None}

        async def on_event(kind, ev):
            if not on_progress:
                return
            if kind == "meta":
                total["v"] = ev.get("total")
                p = Progress(total=total["v"], meta=ev)
            elif kind == "progress":
                p = Progress(downloaded=ev.get("downloaded") or 0, total=total["v"], speed=ev.get("speed"),
                             eta=ev.get("eta"))
                if total["v"] is None and ev.get("file_total") and not ev.get("file_done"):
                    # 合計サイズ不明のときは、いま取得中のファイルの範囲だけで残りを出す
                    p.total = (ev.get("downloaded") or 0) - (ev.get("file_downloaded") or 0) + ev["file_total"]
            else:
                return
            r = on_progress(p)
            if asyncio.iscoroutine(r):
                await r

        r = await self._run({"op": "download", "url": req.url, "selector": format_selector(req.selection),
                             "workdir": str(req.workdir)}, auth=req.auth, on_event=on_event,
                            cancel_token=cancel_token, timeout=6 * 3600)
        return DownloadResult(files=r["files"], title=r.get("title") or "", duration=r.get("duration"),
                              thumbnail=r.get("thumbnail"), overhead_s=r.get("overhead_s") or 0.0,
                              download_s=r.get("download_s") or 0.0, bytes=r.get("bytes") or 0, warnings=r["warnings"])

    async def self_test(self, url: str, *, auth: AuthContext | None = None) -> SelfTestResult:
        tmp = tempfile.mkdtemp(prefix="selftest-", dir=self.work_dir)
        seen = {}
        try:
            r = await self._run({"op": "selftest", "url": url, "workdir": tmp}, auth=auth,
                                on_event=lambda k, ev: seen.update({k: ev}), timeout=240)
            return SelfTestResult(True, True, r.get("title"), r["warnings"], None, r.get("seconds") or 0.0)
        except DownloadFailed as e:
            meta = seen.get("meta") or {}
            return SelfTestResult("meta" in seen, False, meta.get("title"), e.warnings, e)
        finally:
            shutil.rmtree(tmp, ignore_errors=True)

    async def environment(self, version_path: str | None | bool = False) -> dict:
        try:
            return await self._run({"op": "env"}, timeout=60, version_path=version_path)
        except DownloadFailed as e:
            return {"ytdlp_version": None, "deno": None, "deno_supported": False, "ejs": None, "error": e.message}

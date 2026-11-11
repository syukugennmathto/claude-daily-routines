"""yt-dlp の Python API を呼ぶ子プロセス。

親プロセス（ytdlp.py）から `python -m app.downloader.ytdlp_runner` として起動される。
標準入力で JSON の依頼を1つ受け取り、標準出力に JSON を1行ずつ（イベント）書き出す。
子プロセスに分けている理由：
  * PYTHONPATH を切り替えるだけで yt-dlp のバージョンを更新・ロールバックできる
  * yt-dlp が異常終了しても本体が巻き込まれない／キャンセルはプロセスを止めるだけ
"""
from __future__ import annotations

import json
import os
import shutil
import sys
import time

_out = os.fdopen(os.dup(1), "w", buffering=1, encoding="utf-8")
sys.stdout = sys.stderr   # yt-dlp や拡張が標準出力に書いてもプロトコルを壊さないようにする


def emit(event: str, **data) -> None:
    _out.write(json.dumps({"event": event, **data}, ensure_ascii=False, default=str) + "\n")
    _out.flush()


class Log:
    def __init__(self):
        self.warnings: list[str] = []
        self.errors: list[str] = []

    def debug(self, msg):
        pass

    def info(self, msg):
        pass

    def warning(self, msg):
        self.warnings.append(str(msg)[:1000])
        del self.warnings[:-30]

    def error(self, msg):
        self.errors.append(str(msg)[:4000])
        del self.errors[:-10]


FORMAT_KEYS = ("format_id", "ext", "vcodec", "acodec", "height", "width", "fps", "tbr", "abr", "vbr", "asr",
               "audio_channels", "filesize", "filesize_approx", "protocol", "format_note")


def slim(fmt: dict) -> dict:
    return {k: fmt.get(k) for k in FORMAT_KEYS if fmt.get(k) is not None}


def chosen_formats(selected: dict) -> list[dict]:
    return [slim(f) for f in (selected.get("requested_formats") or [selected])]


def base_opts(req: dict, log: Log) -> dict:
    opts = {
        "quiet": True, "noprogress": True, "logger": log, "color": "never",
        "socket_timeout": 30, "retries": 3, "fragment_retries": 5, "extractor_retries": 2,
        "noplaylist": True, "ignoreerrors": False, "cachedir": req.get("cachedir") or False,
        "overwrites": True, "writethumbnail": False, "writesubtitles": False,
        "enable_file_urls": False, "concurrent_fragment_downloads": 1,
    }
    opts.update(req.get("engine_options") or {})
    auth = req.get("auth") or {}
    if auth.get("cookiefile"):
        opts["cookiefile"] = auth["cookiefile"]
    if auth.get("username"):
        opts["username"], opts["password"] = auth["username"], auth.get("password") or ""
    return opts


def select(ydl, formats: list[dict], spec: str) -> list[dict]:
    """フォーマット指定文字列で実際に選ばれるストリームを求める。"""
    if not formats:
        return []
    selector = ydl.build_format_selector(spec)
    ctx = {
        "formats": formats,
        "has_merged_format": any("none" not in (f.get("acodec"), f.get("vcodec")) for f in formats),
        "incomplete_formats": (all(f.get("vcodec") == "none" for f in formats)
                               or all(f.get("acodec") == "none" for f in formats)),
    }
    picked = list(selector(ctx))
    return chosen_formats(picked[0]) if picked else []


class Live(Exception):
    def __init__(self, message, extra):
        super().__init__(message)
        self.extra = extra


def check_live(info: dict) -> None:
    status = info.get("live_status")
    if info.get("is_live") or status in ("is_live", "is_upcoming"):
        msg = "This video is upcoming" if status == "is_upcoming" else "This video is currently live"
        raise Live(msg, {"release_timestamp": info.get("release_timestamp"), "live_status": status})


def thumb(info: dict):
    t = info.get("thumbnail")
    if not t and info.get("thumbnails"):
        t = info["thumbnails"][-1].get("url")
    return t if isinstance(t, str) and t.startswith(("http://", "https://")) else None


def op_env(req, log, yt_dlp):
    info = {"ytdlp_version": yt_dlp.version.__version__, "ytdlp_path": os.path.dirname(yt_dlp.__file__),
            "python": sys.version.split()[0], "deno": None, "deno_supported": False, "ejs": None,
            "ffmpeg": bool(shutil.which("ffmpeg"))}
    try:
        import yt_dlp_ejs
        info["ejs"] = getattr(yt_dlp_ejs, "version", None) or getattr(yt_dlp_ejs, "__version__", None) or "installed"
        if not isinstance(info["ejs"], str):
            info["ejs"] = "installed"
    except Exception:
        info["ejs"] = None
    try:
        with yt_dlp.YoutubeDL({"quiet": True, "logger": log}) as ydl:
            rt = ydl._js_runtimes.get("deno")
            ri = rt.info if rt else None
            if ri:
                info["deno"], info["deno_supported"] = ri.version, bool(ri.supported)
    except Exception as e:
        # 内部APIが変わっても落とさない。deno コマンドの有無だけで判定する
        info["deno_probe_error"] = f"{type(e).__name__}: {e}"
        path = shutil.which("deno")
        info["deno"], info["deno_supported"] = ("found" if path else None), bool(path)
    emit("result", **info)


def op_probe(req, log, yt_dlp):
    t0 = time.time()
    opts = base_opts(req, log)
    want_all = bool(req.get("playlist"))
    opts.update({"noplaylist": not want_all, "extract_flat": "in_playlist",
                 "playlistend": int(req.get("playlist_limit") or 20)})
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(req["url"], download=False)
        if info.get("_type") == "playlist":
            entries = [e for e in (info.get("entries") or []) if e]
            if not entries:
                raise yt_dlp.utils.DownloadError("Playlist is empty: video unavailable")
            if want_all:
                items = [{"url": e.get("url") or e.get("webpage_url"), "title": e.get("title") or "(無題)",
                          "duration": e.get("duration")} for e in entries]
                items = [i for i in items if i["url"]]
                emit("result", playlist=items, playlist_title=info.get("title"), title=info.get("title") or "",
                     duration=None, thumbnail=None, webpage_url=info.get("webpage_url") or req["url"],
                     selections={}, warnings=log.warnings, seconds=time.time() - t0)
                return
            first = entries[0].get("url") or entries[0].get("webpage_url")
            info = ydl.extract_info(first, download=False)
        check_live(info)
        formats = info.get("formats") or [info]
        selections = {name: select(ydl, formats, spec) for name, spec in req["selectors"].items()}
        emit("result", title=info.get("title") or "", duration=info.get("duration"), thumbnail=thumb(info),
             webpage_url=info.get("webpage_url") or req["url"], selections=selections,
             warnings=log.warnings, seconds=time.time() - t0)


def op_download(req, log, yt_dlp):
    workdir = req["workdir"]
    opts = base_opts(req, log)
    opts.update({"format": req["selector"], "paths": {"home": workdir, "temp": workdir},
                 "outtmpl": {"default": "src.%(format_id)s.%(ext)s"}, "restrictfilenames": True,
                 "continuedl": True, "nopart": False})
    t0 = time.time()
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(req["url"], download=False)
        if info.get("_type") == "playlist":
            entries = [e for e in (info.get("entries") or []) if e]
            if not entries:
                raise yt_dlp.utils.DownloadError("Playlist is empty: video unavailable")
            info = entries[0]
        check_live(info)
        chosen = chosen_formats(info)
        overhead = time.time() - t0
        sizes = [f.get("filesize") or f.get("filesize_approx") for f in chosen]
        emit("meta", title=info.get("title") or "", duration=info.get("duration"), thumbnail=thumb(info),
             formats=chosen, overhead_s=overhead, total=sum(sizes) if all(sizes) else None)
        clean = ydl.sanitize_info(info, remove_private_keys=True)

    files, state = [], {"done": 0, "last": 0.0}

    def hook(d):
        fid = (d.get("info_dict") or {}).get("format_id")
        if d["status"] == "finished":
            size = d.get("downloaded_bytes") or d.get("total_bytes") or os.path.getsize(d["filename"])
            state["done"] += size
            files.append({"path": d["filename"], "format_id": fid, "bytes": size})
            emit("progress", downloaded=state["done"], speed=None, eta=None, file_done=True)
        elif d["status"] == "downloading":
            now = time.time()
            if now - state["last"] < 0.5:
                return
            state["last"] = now
            emit("progress", downloaded=state["done"] + (d.get("downloaded_bytes") or 0),
                 file_total=d.get("total_bytes") or d.get("total_bytes_estimate"),
                 file_downloaded=d.get("downloaded_bytes") or 0, speed=d.get("speed"), eta=d.get("eta"))

    opts2 = dict(opts, format=",".join(f["format_id"] for f in chosen), progress_hooks=[hook])
    t1 = time.time()
    with yt_dlp.YoutubeDL(opts2) as ydl:
        ydl.process_ie_result(clean, download=True)
    by_id = {f["format_id"]: f for f in chosen}
    out = [{**by_id.get(f["format_id"], {}), **f} for f in files if os.path.exists(f["path"])]
    if not out:
        raise yt_dlp.utils.DownloadError("No file was downloaded: requested format is not available")
    emit("result", files=out, title=info.get("title") or "", duration=info.get("duration"), thumbnail=thumb(info),
         overhead_s=overhead, download_s=time.time() - t1, bytes=sum(f["bytes"] for f in out), warnings=log.warnings)


def op_selftest(req, log, yt_dlp):
    t0 = time.time()
    opts = base_opts(req, log)
    opts.update({"format": "worstaudio/worst", "paths": {"home": req["workdir"], "temp": req["workdir"]},
                 "outtmpl": {"default": "selftest.%(ext)s"}, "test": True})
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(req["url"], download=False)
        emit("meta", title=info.get("title") or "", duration=info.get("duration"))
        ydl.process_ie_result(ydl.sanitize_info(info, remove_private_keys=True), download=True)
    emit("result", title=info.get("title") or "", warnings=log.warnings, seconds=time.time() - t0)


OPS = {"env": op_env, "probe": op_probe, "download": op_download, "selftest": op_selftest}


def main() -> int:
    req = json.loads(sys.stdin.read())
    log = Log()
    try:
        import yt_dlp
    except Exception as e:
        emit("error", exc_type="ImportError", message=f"yt-dlp could not be imported: {e}", warnings=[])
        return 3
    try:
        OPS[req["op"]](req, log, yt_dlp)
        return 0
    except Live as e:
        emit("error", exc_type="Live", message=str(e), category="live", extra=e.extra, warnings=log.warnings)
    except yt_dlp.utils.DownloadError as e:
        orig = e.exc_info[1] if getattr(e, "exc_info", None) and e.exc_info[1] is not None else e
        msg = str(e)
        if msg.startswith("ERROR: "):
            msg = msg[7:]
        emit("error", exc_type=type(orig).__name__, message=msg, warnings=log.warnings)
    except Exception as e:
        emit("error", exc_type=type(e).__name__, message=f"{type(e).__name__}: {e}", warnings=log.warnings)
    return 1


if __name__ == "__main__":
    sys.exit(main())

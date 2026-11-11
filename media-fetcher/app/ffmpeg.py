"""ffmpeg による変換・結合と、初回ベンチマーク。"""
from __future__ import annotations

import asyncio
import json
import os
import signal
import time
from collections import deque
from pathlib import Path

from .estimator import REENCODE_REF_PIXELS
from .formats import Preset


class FFmpegError(Exception):
    def __init__(self, message: str, log_tail: str = ""):
        super().__init__(message)
        self.log_tail = log_tail


async def ffprobe(path: str | Path) -> dict:
    proc = await asyncio.create_subprocess_exec(
        "ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(path),
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    out, err = await proc.communicate()
    if proc.returncode != 0:
        raise FFmpegError("ffprobe failed", err.decode("utf-8", "replace")[-2000:])
    return json.loads(out or b"{}")


def _stream(info: dict, kind: str) -> dict | None:
    return next((s for s in info.get("streams", []) if s.get("codec_type") == kind
                 and not (s.get("disposition") or {}).get("attached_pic")), None)


async def run_ffmpeg(args: list[str], duration: float | None = None, on_progress=None, cancel_token=None) -> float:
    """ffmpeg を実行し、所要秒数を返す。失敗時は FFmpegError（ログ末尾つき）。"""
    cmd = ["ffmpeg", "-hide_banner", "-nostdin", "-y", "-loglevel", "warning", "-progress", "pipe:1", "-nostats", *args]
    t0 = time.time()
    proc = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE, start_new_session=True)
    tail: deque[str] = deque(maxlen=40)

    async def read_err():
        async for line in proc.stderr:
            tail.append(line.decode("utf-8", "replace").rstrip())

    async def read_out():
        async for line in proc.stdout:
            key, _, val = line.decode("ascii", "replace").strip().partition("=")
            if key == "out_time_us" and duration and on_progress and val.lstrip("-").isdigit():
                r = on_progress(min(1.0, max(0.0, int(val) / 1e6 / duration)))
                if asyncio.iscoroutine(r):
                    await r

    async def watch_cancel():
        await cancel_token.wait()
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            pass

    watcher = asyncio.ensure_future(watch_cancel()) if cancel_token is not None else None
    try:
        await asyncio.gather(read_err(), read_out())
        code = await proc.wait()
    except asyncio.CancelledError:
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            pass
        raise
    finally:
        if watcher:
            watcher.cancel()
    if cancel_token is not None and cancel_token.is_set():
        from .downloader.base import Cancelled
        raise Cancelled()
    if code != 0:
        raise FFmpegError(f"ffmpeg exited with code {code}", "\n".join(tail))
    return time.time() - t0


async def plan_conversion(preset: Preset, files: list[dict], out_path: Path, title: str = "") -> dict:
    """取得した素材から ffmpeg の引数を組み立てる。実際のコーデックは ffprobe で確認する。"""
    probes = [await ffprobe(f["path"]) for f in files]
    meta = ["-metadata", f"title={title}"] if title else []
    if preset.kind in ("mp3", "wav"):
        idx = next((i for i, p in enumerate(probes) if _stream(p, "audio")), None)
        if idx is None:
            raise FFmpegError("no audio stream in downloaded file", "音声ストリームが見つかりません。")
        codec = (["-c:a", "libmp3lame", "-b:a", f"{preset.quality}k"] if preset.kind == "mp3"
                 else ["-c:a", "pcm_s16le"])
        args = ["-i", files[idx]["path"], "-vn", "-map", "0:a:0", *codec, *meta, str(out_path)]
        return {"args": args, "op": preset.kind, "reencode": False, "pixels": 0}

    v_idx = next((i for i, p in enumerate(probes) if _stream(p, "video")), None)
    if v_idx is None:
        raise FFmpegError("no video stream in downloaded file", "映像ストリームが見つかりません（音声のみの動画の可能性）。")
    a_idx = next((i for i, p in enumerate(probes) if i != v_idx and _stream(p, "audio")), None)
    if a_idx is None and _stream(probes[v_idx], "audio"):
        a_idx = v_idx
    vs = _stream(probes[v_idx], "video")
    reencode = vs.get("codec_name") != "h264"
    args = ["-i", files[v_idx]["path"]]
    if a_idx is not None and a_idx != v_idx:
        args += ["-i", files[a_idx]["path"]]
    args += ["-map", "0:v:0"]
    if reencode:
        args += ["-c:v", "libx264", "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p"]
    else:
        args += ["-c:v", "copy"]
    audio_reencode = False
    if a_idx is not None:
        args += ["-map", "0:a:0" if a_idx == v_idx else "1:a:0"]
        audio_reencode = _stream(probes[a_idx], "audio").get("codec_name") != "aac"
        args += ["-c:a", "aac", "-b:a", "192k"] if audio_reencode else ["-c:a", "copy"]
    args += ["-movflags", "+faststart", *meta, str(out_path)]
    return {"args": args, "op": "mp4_reencode" if reencode else "mp4_merge", "reencode": reencode,
            "audio_reencode": audio_reencode, "pixels": (vs.get("width") or 0) * (vs.get("height") or 0),
            "vcodec": vs.get("codec_name")}


MIN_LEARN_SECONDS = 0.2   # これより短い変換は起動時間の割合が大きく、学習に使わない


def learned_rate(op: str, duration: float, seconds: float, pixels: int = 0) -> float | None:
    """変換の実測から速度倍率を求める。再エンコードは 720p 相当に正規化する。"""
    if not duration or seconds < MIN_LEARN_SECONDS:
        return None
    rate = duration / seconds
    if op == "mp4_reencode" and pixels:
        rate *= pixels / REENCODE_REF_PIXELS
    return rate


async def benchmark(work_dir: Path, seconds: int = 20) -> dict[str, float]:
    """短い合成素材で各処理の速度倍率（実時間の何倍速か）を測る。"""
    work_dir.mkdir(parents=True, exist_ok=True)
    src_v, src_a = work_dir / "bench_v.mkv", work_dir / "bench_a.m4a"
    out: dict[str, float] = {}
    try:
        await run_ffmpeg(["-f", "lavfi", "-i", f"testsrc2=size=1280x720:rate=30:duration={seconds}",
                          "-c:v", "libvpx-vp9", "-deadline", "realtime", "-cpu-used", "8", "-b:v", "1500k", str(src_v)])
        await run_ffmpeg(["-f", "lavfi", "-i", f"sine=frequency=440:duration={seconds}:sample_rate=44100",
                          "-ac", "2", "-c:a", "aac", "-b:a", "128k", str(src_a)])
        tests = {
            "mp3": ["-i", str(src_a), "-c:a", "libmp3lame", "-b:a", "192k", str(work_dir / "bench.mp3")],
            "wav": ["-i", str(src_a), "-c:a", "pcm_s16le", str(work_dir / "bench.wav")],
            "mp4_reencode": ["-i", str(src_v), "-i", str(src_a), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264",
                             "-preset", "veryfast", "-crf", "22", "-pix_fmt", "yuv420p", "-c:a", "copy",
                             str(work_dir / "bench_re.mp4")],
        }
        for op, args in tests.items():
            t = await run_ffmpeg(args)
            out[op] = seconds / max(t, 0.02)
        # 結合（コピー）は再エンコード結果の H.264 を素材にする
        t = await run_ffmpeg(["-i", str(work_dir / "bench_re.mp4"), "-i", str(src_a), "-map", "0:v:0", "-map", "1:a:0",
                              "-c", "copy", "-movflags", "+faststart", str(work_dir / "bench_merge.mp4")])
        out["mp4_merge"] = seconds / max(t, 0.02)
    finally:
        for p in work_dir.glob("bench*"):
            p.unlink(missing_ok=True)
    return out

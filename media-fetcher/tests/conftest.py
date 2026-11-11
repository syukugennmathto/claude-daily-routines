import asyncio
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import Settings  # noqa: E402
from app.db import DB  # noqa: E402
from app.downloader.base import DownloadFailed, DownloadResult, Progress, ProbeResult, SelfTestResult  # noqa: E402
from app.login import LoginManager  # noqa: E402

TOKEN = "test-token-0123456789abcdef"
COOKIE_OK = ("# Netscape HTTP Cookie File\n"
             ".youtube.com\tTRUE\t/\tTRUE\t4102444800\tLOGIN_INFO\tsecretvalue1\n"
             ".youtube.com\tTRUE\t/\tTRUE\t4102444800\t__Secure-1PSID\tsecretvalue2\n")
COOKIE_EXPIRED = ("# Netscape HTTP Cookie File\n"
                  ".youtube.com\tTRUE\t/\tTRUE\t1000000000\tLOGIN_INFO\tsecretvalue1\n")


def run(coro):
    return asyncio.run(coro)


@pytest.fixture
def settings(tmp_path, monkeypatch):
    for k in ("NICONICO_USERNAME", "NICONICO_PASSWORD", "HEALTHCHECK_URL_YOUTUBE", "HEALTHCHECK_URL_NICONICO",
              "LOGIN_MODE_YOUTUBE", "LOGIN_MODE_NICONICO", "MAX_CONCURRENCY"):
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv("DATA_DIR", str(tmp_path / "data"))
    monkeypatch.setenv("APP_TOKEN", TOKEN)
    monkeypatch.setenv("RETRY_BASE_SECONDS", "30")
    monkeypatch.setenv("AUTO_UPDATE", "false")
    import app.ffmpeg
    monkeypatch.setattr(app.ffmpeg, "MIN_LEARN_SECONDS", 0.0)   # テスト素材は2秒しかないため
    s = Settings()
    s.ensure_dirs()
    return s


@pytest.fixture
def db(settings):
    d = DB(settings.db_path)
    yield d
    d.close()


@pytest.fixture
def lm(settings, db):
    return LoginManager(settings, db)


@pytest.fixture(scope="session")
def media(tmp_path_factory):
    """ffmpeg で作る 2 秒のテスト素材（H.264+AAC と VP9+Opus）。"""
    if not shutil.which("ffmpeg"):
        pytest.skip("ffmpeg が必要です")
    d = tmp_path_factory.mktemp("media")
    base = ["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=320x180:rate=15:duration=2",
            "-f", "lavfi", "-i", "sine=frequency=440:duration=2"]
    subprocess.run([*base, "-c:v", "libx264", "-preset", "ultrafast", "-c:a", "aac", "-shortest", str(d / "h264.mp4")], check=True)
    subprocess.run([*base, "-c:v", "libvpx-vp9", "-deadline", "realtime", "-cpu-used", "8", "-c:a", "libopus",
                    "-shortest", str(d / "vp9.webm")], check=True)
    return d


class FakeDownloader:
    """Downloader インターフェースの差し替え実装（yt-dlp を使わない）。

    script に並べた結果を呼び出しごとに順に返す。例外を置けば、その回は失敗する。
    """
    name = "fake"

    def __init__(self, source: Path | None = None, script=None, title="テスト動画", duration=2.0):
        self.source, self.script, self.title, self.duration = source, list(script or []), title, duration
        self.calls: list[dict] = []

    def _next(self, kind, auth):
        self.calls.append({"op": kind, "login": auth is not None})
        if self.script:
            item = self.script.pop(0)
            if isinstance(item, Exception):
                raise item

    async def probe(self, url, *, auth=None, playlist=False, playlist_limit=20):
        self._next("probe", auth)
        if playlist:
            return ProbeResult(self.title, None, None, url, {}, playlist=[
                {"url": f"https://example.com/v/{i}", "title": f"動画{i}", "duration": 60} for i in range(30)][:playlist_limit],
                playlist_title="リスト")
        fmt = {"format_id": "18", "ext": "mp4", "vcodec": "avc1.42001E", "acodec": "mp4a.40.2", "height": 360,
               "filesize": 1_000_000}
        return ProbeResult(self.title, self.duration, "https://example.com/t.jpg", url,
                           {s: [fmt] for s in ("audio", "mp4:best", "mp4:1080", "mp4:720", "mp4:480")})

    async def download(self, req, on_progress=None, cancel_token=None):
        self._next("download", req.auth)
        dest = Path(req.workdir) / ("src" + self.source.suffix)
        shutil.copyfile(self.source, dest)
        size = dest.stat().st_size
        if on_progress:
            on_progress(Progress(total=size, meta={"title": self.title, "duration": self.duration, "thumbnail": None,
                                                   "formats": [{"format_id": "x", "vcodec": "avc1", "acodec": "mp4a"}],
                                                   "overhead_s": 0.1}))
            on_progress(Progress(downloaded=size, total=size, speed=1e6, eta=0))
        return DownloadResult([{"path": str(dest), "format_id": "x", "vcodec": "avc1", "acodec": "mp4a", "height": 180,
                                "bytes": size}], self.title, self.duration, None, 0.1, 0.2, size)

    async def self_test(self, url, *, auth=None):
        try:
            self._next("selftest", auth)
        except DownloadFailed as e:
            return SelfTestResult(False, False, None, [], e)
        return SelfTestResult(True, True, self.title)

    async def environment(self, version_path=False):
        return {"ytdlp_version": "fake", "deno": "2.5.0", "deno_supported": True, "ejs": "1", "ffmpeg": True}

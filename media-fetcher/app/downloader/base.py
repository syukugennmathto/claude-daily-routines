"""取得処理の抽象インターフェース。

アプリ本体（ジョブ処理・プレビュー・自己診断）はこの Downloader だけを相手にする。
yt-dlp 以外の実装に差し替えるときは、このインターフェースを満たすクラスを作り、
adapters.py の SiteAdapter.downloader にその名前を指定する。
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Awaitable, Callable, Protocol


@dataclass
class AuthContext:
    """ログイン情報。値はログ・エラー詳細に出してはならない。"""
    cookiefile: str | None = None
    username: str | None = None
    password: str | None = None

    @property
    def method(self) -> str:
        return "cookies" if self.cookiefile else "password"


@dataclass
class ProbeResult:
    title: str
    duration: float | None
    thumbnail: str | None
    webpage_url: str
    selections: dict[str, list[dict]]            # "audio" / "mp4:720" など → 選ばれたストリーム
    playlist: list[dict] | None = None           # 全件指定のとき：[{url, title, duration}]
    playlist_title: str | None = None
    warnings: list[str] = field(default_factory=list)
    seconds: float = 0.0


@dataclass
class DownloadRequest:
    url: str
    selection: str            # formats.Preset.selection
    workdir: Path
    auth: AuthContext | None = None


@dataclass
class Progress:
    downloaded: int = 0
    total: int | None = None
    speed: float | None = None    # バイト/秒
    eta: float | None = None      # 秒
    meta: dict | None = None      # 取得開始時に一度だけ：title, duration, thumbnail, formats, overhead_s


@dataclass
class DownloadResult:
    files: list[dict]             # [{path, format_id, vcodec, acodec, height, ...}]
    title: str
    duration: float | None
    thumbnail: str | None
    overhead_s: float
    download_s: float
    bytes: int
    warnings: list[str] = field(default_factory=list)


@dataclass
class SelfTestResult:
    meta_ok: bool
    download_ok: bool
    title: str | None = None
    warnings: list[str] = field(default_factory=list)
    error: "DownloadFailed | None" = None
    seconds: float = 0.0


class DownloadFailed(Exception):
    """取得に失敗した。分類は error_rules が message / exc_type から行う。"""

    def __init__(self, message: str, exc_type: str = "", *, category: str | None = None,
                 extra: dict | None = None, warnings: list[str] | None = None):
        super().__init__(message)
        self.message = message
        self.exc_type = exc_type
        self.category = category      # 実装側で分類が確定している場合のみ
        self.extra = extra or {}
        self.warnings = warnings or []


class Cancelled(Exception):
    pass


ProgressCallback = Callable[[Progress], Awaitable[None] | None]


class Downloader(Protocol):
    name: str

    async def probe(self, url: str, *, auth: AuthContext | None = None, playlist: bool = False,
                    playlist_limit: int = 20) -> ProbeResult:
        """メタデータだけ取得し、形式ごとに選ばれるストリームを返す。"""

    async def download(self, req: DownloadRequest, on_progress: ProgressCallback | None = None,
                       cancel_token: object | None = None) -> DownloadResult:
        """素材ファイルを workdir に取得する（変換はしない）。"""

    async def self_test(self, url: str, *, auth: AuthContext | None = None) -> SelfTestResult:
        """自己診断：メタデータ取得と、ごく短い区間のダウンロード。"""

    async def environment(self) -> dict:
        """エンジンのバージョン、JSランタイムの認識状況など。"""

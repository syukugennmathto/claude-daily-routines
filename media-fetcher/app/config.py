"""設定の読み込み。すべて環境変数（.env）から取得する。"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

LOGIN_MODES = ("always", "on_failure", "never")
_PLACEHOLDER_TOKENS = {"", "change-me", "changeme", "CHANGE_ME"}


def _int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, "") or default)
    except ValueError:
        return default


def _float(name: str, default: float) -> float:
    try:
        return float(os.environ.get(name, "") or default)
    except ValueError:
        return default


def _mode(name: str, default: str) -> str:
    v = (os.environ.get(name) or default).strip().lower()
    return v if v in LOGIN_MODES else default


@dataclass
class Settings:
    data_dir: Path = field(default_factory=lambda: Path(os.environ.get("DATA_DIR", "/data")))
    app_token: str = field(default_factory=lambda: os.environ.get("APP_TOKEN", "").strip())
    # HTTPS（tailscale serve など）経由のときだけ Cookie に Secure を付ける
    cookie_secure: bool = field(default_factory=lambda: os.environ.get("COOKIE_SECURE", "auto").lower() == "true")

    max_concurrency: int = field(default_factory=lambda: min(2, max(1, _int("MAX_CONCURRENCY", 1))))
    job_gap_min: float = field(default_factory=lambda: _float("JOB_GAP_MIN_SECONDS", 3))
    job_gap_max: float = field(default_factory=lambda: _float("JOB_GAP_MAX_SECONDS", 8))
    max_retries: int = field(default_factory=lambda: _int("MAX_RETRIES", 3))
    retry_base: float = field(default_factory=lambda: _float("RETRY_BASE_SECONDS", 30))
    bot_retry_base: float = field(default_factory=lambda: _float("BOT_RETRY_BASE_SECONDS", 600))
    retention_days: int = field(default_factory=lambda: _int("RETENTION_DAYS", 7))
    playlist_limit: int = field(default_factory=lambda: min(20, max(1, _int("PLAYLIST_LIMIT", 20))))

    default_download_mbps: float = field(default_factory=lambda: _float("DEFAULT_DOWNLOAD_MBPS", 30))
    default_transfer_mbps: float = field(default_factory=lambda: _float("DEFAULT_TRANSFER_MBPS", 20))
    default_overhead_seconds: float = field(default_factory=lambda: _float("DEFAULT_OVERHEAD_SECONDS", 8))

    health_url_youtube: str = field(default_factory=lambda: os.environ.get("HEALTHCHECK_URL_YOUTUBE", "").strip())
    health_url_niconico: str = field(default_factory=lambda: os.environ.get("HEALTHCHECK_URL_NICONICO", "").strip())
    daily_hour: int = field(default_factory=lambda: _int("DAILY_MAINTENANCE_HOUR", 4))
    auto_update: bool = field(default_factory=lambda: os.environ.get("AUTO_UPDATE", "true").lower() != "false")
    ytdlp_channel: str = field(default_factory=lambda: os.environ.get("YTDLP_CHANNEL", "stable").strip().lower())

    login_mode_youtube: str = field(default_factory=lambda: _mode("LOGIN_MODE_YOUTUBE", "on_failure"))
    login_mode_niconico: str = field(default_factory=lambda: _mode("LOGIN_MODE_NICONICO", "always"))
    niconico_username: str = field(default_factory=lambda: os.environ.get("NICONICO_USERNAME", "").strip())
    niconico_password: str = field(default_factory=lambda: os.environ.get("NICONICO_PASSWORD", ""))

    @property
    def db_path(self) -> Path:
        return self.data_dir / "config" / "app.db"

    @property
    def downloads_dir(self) -> Path:
        return self.data_dir / "downloads"

    @property
    def work_dir(self) -> Path:
        return self.data_dir / "work"

    @property
    def cookies_dir(self) -> Path:
        return self.data_dir / "cookies"

    @property
    def ytdlp_dir(self) -> Path:
        return self.data_dir / "ytdlp"

    def ensure_dirs(self) -> None:
        for d in (self.db_path.parent, self.downloads_dir, self.work_dir, self.cookies_dir, self.ytdlp_dir):
            d.mkdir(parents=True, exist_ok=True)
        try:
            os.chmod(self.cookies_dir, 0o700)
        except OSError:
            pass

    def token_problem(self) -> str | None:
        if self.app_token in _PLACEHOLDER_TOKENS:
            return "APP_TOKEN が未設定です。.env に十分に長いランダムな文字列を設定してください。"
        if len(self.app_token) < 16:
            return "APP_TOKEN が短すぎます（16文字以上にしてください）。"
        return None

    def secrets(self) -> list[str]:
        """ログやエラー詳細に出してはいけない文字列。"""
        return [s for s in (self.app_token, self.niconico_password, self.niconico_username) if s]

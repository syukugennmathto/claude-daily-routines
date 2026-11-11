"""サイトごとの設定（アダプター）。新しいサイトを足すときはここに追記する。"""
from __future__ import annotations

from dataclasses import dataclass, field
from urllib.parse import urlsplit


@dataclass(frozen=True)
class SiteAdapter:
    key: str
    label: str
    hosts: tuple[str, ...]                      # 末尾一致するホスト名
    downloader: str = "ytdlp"                   # 使用する Downloader 実装の名前
    login_methods: tuple[str, ...] = ()         # "cookies" / "password"
    default_login_mode: str = "never"
    session_cookies: tuple[str, ...] = ()       # ログイン状態を表す Cookie 名（期限切れ判定に使う）
    cookie_domains: tuple[str, ...] = ()
    engine_options: dict = field(default_factory=dict)   # Downloader 実装へ渡す追加オプション


ADAPTERS: tuple[SiteAdapter, ...] = (
    SiteAdapter(
        key="youtube", label="YouTube",
        hosts=("youtube.com", "youtu.be", "youtube-nocookie.com"),
        login_methods=("cookies",), default_login_mode="on_failure",
        session_cookies=("__Secure-1PSID", "__Secure-3PSID", "SID", "LOGIN_INFO"),
        cookie_domains=("youtube.com", "google.com"),
        engine_options={"sleep_interval_requests": 0.5},
    ),
    SiteAdapter(
        key="niconico", label="ニコニコ動画",
        hosts=("nicovideo.jp", "nico.ms"),
        login_methods=("password", "cookies"), default_login_mode="always",
        session_cookies=("user_session",),
        cookie_domains=("nicovideo.jp",),
        engine_options={"sleep_interval_requests": 0.5},
    ),
)

GENERIC = SiteAdapter(key="generic", label="その他のサイト", hosts=())
_BY_KEY = {a.key: a for a in (*ADAPTERS, GENERIC)}


def adapter_for_url(url: str) -> SiteAdapter:
    host = (urlsplit(url).hostname or "").lower().rstrip(".")
    for a in ADAPTERS:
        if any(host == h or host.endswith("." + h) for h in a.hosts):
            return a
    return GENERIC


def adapter(key: str) -> SiteAdapter:
    return _BY_KEY.get(key, GENERIC)


def login_sites() -> list[SiteAdapter]:
    return [a for a in ADAPTERS if a.login_methods]

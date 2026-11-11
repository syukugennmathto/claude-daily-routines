"""ログイン（Cookie・ID/パスワード）の管理と、ログインモードに沿った実行ポリシー。"""
from __future__ import annotations

import os
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Awaitable, Callable, TypeVar

from . import error_rules
from .config import LOGIN_MODES, Settings
from .db import DB
from .downloader.adapters import SiteAdapter, adapter, login_sites
from .downloader.base import AuthContext, DownloadFailed

T = TypeVar("T")
MAX_COOKIE_BYTES = 1024 * 1024
STATUS_VALID, STATUS_EXPIRED, STATUS_UNSET = "valid", "expired", "unset"
STATUS_LABEL = {STATUS_VALID: "有効", STATUS_EXPIRED: "期限切れ", STATUS_UNSET: "未設定"}


class CookieFileError(ValueError):
    pass


def parse_cookies_txt(text: str) -> list[dict]:
    """Netscape 形式の cookies.txt を読む。形式が違えば CookieFileError。"""
    cookies = []
    for raw in text.splitlines():
        line = raw.strip()
        if line.startswith("#HttpOnly_"):
            line = line[len("#HttpOnly_"):]
        elif not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) != 7:
            raise CookieFileError("cookies.txt（Netscape形式）として読めない行があります。")
        try:
            expires = int(float(parts[4] or 0))
        except ValueError:
            raise CookieFileError("cookies.txt の有効期限の欄が数値ではありません。") from None
        cookies.append({"domain": parts[0].lstrip(".").lower(), "expires": expires, "name": parts[5]})
    if not cookies:
        raise CookieFileError("Cookie が1件も含まれていません。")
    return cookies


def static_cookie_status(text: str, ad: SiteAdapter, now: float | None = None) -> tuple[str, str]:
    """ファイルの中身だけで分かる範囲のログイン状態。"""
    now = now or time.time()
    try:
        cookies = parse_cookies_txt(text)
    except CookieFileError as e:
        return STATUS_EXPIRED, str(e)
    mine = [c for c in cookies if any(c["domain"] == d or c["domain"].endswith("." + d) for d in ad.cookie_domains)]
    if not mine:
        return STATUS_EXPIRED, f"{ad.label} 用の Cookie が含まれていません。"
    session = [c for c in mine if c["name"] in ad.session_cookies]
    if not session:
        return STATUS_EXPIRED, "ログイン状態を表す Cookie がありません（ログインせずに書き出した可能性）。"
    if all(c["expires"] and c["expires"] < now for c in session):
        return STATUS_EXPIRED, "ログイン Cookie の有効期限が切れています。"
    return STATUS_VALID, ""


class LoginManager:
    def __init__(self, settings: Settings, db: DB):
        self.s, self.db = settings, db

    # ---- モード ----
    def mode(self, site: str) -> str:
        ad = adapter(site)
        if not ad.login_methods:
            return "never"
        default = getattr(self.s, f"login_mode_{site}", ad.default_login_mode)
        v = self.db.get_setting(f"login_mode:{site}", default)
        return v if v in LOGIN_MODES else default

    def set_mode(self, site: str, mode: str) -> None:
        if mode not in LOGIN_MODES or not adapter(site).login_methods:
            raise ValueError("ログインモードの指定が正しくありません。")
        self.db.set_setting(f"login_mode:{site}", mode)

    # ---- 認証情報 ----
    def cookie_path(self, site: str) -> Path:
        return self.s.cookies_dir / f"{adapter(site).key}.txt"

    def has_cookie(self, site: str) -> bool:
        return self.cookie_path(site).is_file()

    def auth(self, site: str) -> AuthContext | None:
        ad = adapter(site)
        if "cookies" in ad.login_methods and self.has_cookie(site):
            return AuthContext(cookiefile=str(self.cookie_path(site)))
        if "password" in ad.login_methods and site == "niconico" and self.s.niconico_username and self.s.niconico_password:
            return AuthContext(username=self.s.niconico_username, password=self.s.niconico_password)
        return None

    def save_cookie(self, site: str, text: str) -> tuple[str, str]:
        ad = adapter(site)
        if "cookies" not in ad.login_methods:
            raise CookieFileError("このサイトは cookies.txt によるログインに対応していません。")
        if len(text.encode("utf-8", "replace")) > MAX_COOKIE_BYTES:
            raise CookieFileError("ファイルが大きすぎます（1MBまで）。")
        parse_cookies_txt(text)
        path = self.cookie_path(site)
        tmp = path.with_suffix(".tmp")
        fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as f:
            f.write(text if text.endswith("\n") else text + "\n")
        os.chmod(tmp, 0o600)
        os.replace(tmp, path)
        status, detail = static_cookie_status(text, ad)
        self.set_status(site, status, detail or "アップロード直後（オンライン確認は次回の自己診断で行います）")
        return status, detail

    def delete_cookie(self, site: str) -> None:
        self.cookie_path(site).unlink(missing_ok=True)
        self.db.set_setting(f"login_status:{site}", None)

    # ---- 状態 ----
    def set_status(self, site: str, status: str, detail: str = "") -> None:
        self.db.set_setting(f"login_status:{site}", {"status": status, "detail": detail, "checked_at": time.time()})

    def mark_expired(self, site: str, detail: str = "") -> None:
        if adapter(site).login_methods:
            self.set_status(site, STATUS_EXPIRED, detail)

    def status(self, site: str) -> dict:
        ad = adapter(site)
        a = self.auth(site)
        if a is None:
            return {"site": site, "label": ad.label, "status": STATUS_UNSET, "status_label": STATUS_LABEL[STATUS_UNSET],
                    "method": None, "detail": "", "checked_at": None, "mode": self.mode(site),
                    "methods": list(ad.login_methods), "has_cookie": False}
        saved = self.db.get_setting(f"login_status:{site}") or {}
        status, detail = saved.get("status") or STATUS_VALID, saved.get("detail") or ""
        if a.cookiefile and status != STATUS_EXPIRED:
            try:
                st, d = static_cookie_status(Path(a.cookiefile).read_text("utf-8", "replace"), ad)
            except OSError:
                st, d = STATUS_EXPIRED, "Cookie ファイルを読めません。"
            if st == STATUS_EXPIRED:
                status, detail = st, d
        return {"site": site, "label": ad.label, "status": status, "status_label": STATUS_LABEL[status],
                "method": a.method, "detail": detail, "checked_at": saved.get("checked_at"), "mode": self.mode(site),
                "methods": list(ad.login_methods), "has_cookie": self.has_cookie(site)}

    def all_status(self) -> list[dict]:
        return [self.status(a.key) for a in login_sites()]

    def banners(self) -> list[dict]:
        """ジョブ一覧・管理画面の上部に出す警告。"""
        out = []
        for st in self.all_status():
            if st["status"] == STATUS_EXPIRED and st["mode"] != "never":
                what = "Cookie" if st["method"] == "cookies" else "ログイン情報"
                out.append({"site": st["site"], "message": f"{st['label']}：{what}期限切れ：再設定してください"})
        return out


@dataclass
class LoginOutcome:
    used_login: bool
    retried_with_login: bool = False


async def run_with_login_policy(
    lm: LoginManager, site: str, fn: Callable[[AuthContext | None], Awaitable[T]], *, force_login: bool = False,
) -> tuple[T, LoginOutcome]:
    """ログインモードに従って fn を実行する。

    always     : 認証情報があれば最初からログイン状態で実行
    on_failure : まず未ログインで実行し、「ログイン必須・年齢制限・ボット判定」で失敗したときだけ
                 ログイン状態で1回だけ自動再試行
    never      : 常に未ログイン
    force_login: ユーザーが「ログインして再試行」を押したとき（never 以外で有効）

    失敗時は DownloadFailed に used_login 属性を付けて送出する。
    """
    mode = lm.mode(site)
    auth = lm.auth(site) if mode != "never" else None
    first_auth = auth if (mode == "always" or force_login) else None
    outcome = LoginOutcome(used_login=first_auth is not None)

    def finish(result: T) -> tuple[T, LoginOutcome]:
        if outcome.used_login:
            warn = error_rules.login_warning(getattr(result, "warnings", None) or [])
            if warn:
                lm.mark_expired(site, warn)
            else:
                lm.set_status(site, STATUS_VALID, "")
        return result, outcome

    try:
        return finish(await fn(first_auth))
    except DownloadFailed as e:
        c = error_rules.classify(e.message, e.exc_type, used_login=first_auth is not None)
        if e.category:
            c = error_rules.from_category(e.category, e.message)
        if first_auth is not None or auth is None or mode != "on_failure" or not c.login_may_help:
            _note_failure(lm, site, e, c, first_auth is not None)
            raise
    # on_failure：ログイン状態で1回だけ再試行
    outcome = LoginOutcome(used_login=True, retried_with_login=True)
    try:
        return finish(await fn(auth))
    except DownloadFailed as e:
        c = error_rules.classify(e.message, e.exc_type, used_login=True)
        _note_failure(lm, site, e, c, True)
        raise


def _note_failure(lm: LoginManager, site: str, e: DownloadFailed, c: error_rules.Classified, used_login: bool) -> None:
    e.used_login = used_login
    warn = error_rules.login_warning(e.warnings) if used_login else None
    if c.category == error_rules.COOKIE_EXPIRED or warn:
        lm.mark_expired(site, warn or e.message[:300])

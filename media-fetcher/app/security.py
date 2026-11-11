"""入力検証・ファイル名の安全化・秘密情報の伏せ字。"""
from __future__ import annotations

import ipaddress
import re
import socket
import unicodedata
from pathlib import Path
from urllib.parse import quote, urlsplit


class UrlRejected(ValueError):
    pass


_BLOCKED_SUFFIXES = (".local", ".localhost", ".internal", ".lan", ".home", ".intranet", ".home.arpa")


def _ip_is_internal(ip: ipaddress._BaseAddress) -> bool:
    if getattr(ip, "ipv4_mapped", None):
        ip = ip.ipv4_mapped
    return not ip.is_global or ip.is_multicast


def validate_url(url: str, *, resolve: bool = False, resolver=socket.getaddrinfo) -> str:
    """http/https の公開アドレスだけを通す。問題があれば UrlRejected。"""
    url = (url or "").strip()
    if not url or len(url) > 2000:
        raise UrlRejected("URLが空、または長すぎます。")
    if any(ord(c) < 0x20 or c in " \\" for c in url):
        raise UrlRejected("URLに使えない文字が含まれています。")
    try:
        parts = urlsplit(url)
        port = parts.port
    except ValueError:
        raise UrlRejected("URLの形式が正しくありません。") from None
    if parts.scheme.lower() not in ("http", "https"):
        raise UrlRejected("http:// または https:// で始まるURLだけ指定できます。")
    if parts.username or parts.password:
        raise UrlRejected("ユーザー名・パスワード入りのURLは指定できません。")
    host = (parts.hostname or "").rstrip(".").lower()
    if not host:
        raise UrlRejected("URLにホスト名がありません。")
    if port is not None and port not in (80, 443, 8080, 8443):
        raise UrlRejected("このポート番号のURLは指定できません。")
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        ip = None
    if ip is not None:
        if _ip_is_internal(ip):
            raise UrlRejected("ローカル・プライベートなアドレスは指定できません。")
        return url
    if re.fullmatch(r"[0-9a-fx.]+", host):
        # 0x7f.1 や 2130706433 のような数値表記のIPアドレス
        raise UrlRejected("数値表記のアドレスは指定できません。")
    if "." not in host or host == "localhost" or host.endswith(_BLOCKED_SUFFIXES):
        raise UrlRejected("ローカルネットワーク内のホスト名は指定できません。")
    if resolve:
        try:
            infos = resolver(host, None)
        except OSError:
            raise UrlRejected("ホスト名を解決できません。URLを確認してください。") from None
        for info in infos:
            if _ip_is_internal(ipaddress.ip_address(info[4][0].split("%")[0])):
                raise UrlRejected("ローカル・プライベートなアドレスを指すURLは指定できません。")
    return url


_WINDOWS_RESERVED = {"CON", "PRN", "AUX", "NUL", *(f"COM{i}" for i in range(1, 10)), *(f"LPT{i}" for i in range(1, 10))}


def sanitize_filename(name: str, ext: str, max_bytes: int = 180) -> str:
    """タイトルから安全なファイル名を作る（日本語は残す）。"""
    name = unicodedata.normalize("NFC", name or "")
    name = "".join(c for c in name if unicodedata.category(c)[0] != "C")
    name = re.sub(r'[\\/:*?"<>|]', "_", name)
    name = re.sub(r"\s+", " ", name).strip(" .")
    if not name or name.upper() in _WINDOWS_RESERVED:
        name = "download"
    ext = re.sub(r"[^a-z0-9]", "", ext.lower()) or "bin"
    while len(name.encode("utf-8")) > max_bytes:
        name = name[:-1]
    return f"{name.rstrip(' .') or 'download'}.{ext}"


def safe_child(base: Path, name: str) -> Path:
    """base 配下に収まるパスだけを返す（パストラバーサル対策）。"""
    base = base.resolve()
    target = (base / name).resolve()
    if target == base or base not in target.parents:
        raise ValueError("不正なパスです。")
    return target


def content_disposition(filename: str) -> str:
    """RFC 6266 / RFC 5987 形式。ASCII の代替名と UTF-8 名の両方を付ける。"""
    stem, _, ext = filename.rpartition(".")
    ascii_stem = re.sub(r"[^A-Za-z0-9._ -]", "_", stem).strip(" ._") or "download"
    ascii_name = f"{ascii_stem[:80]}.{ext}" if ext else ascii_stem[:80]
    return f"attachment; filename=\"{ascii_name}\"; filename*=UTF-8''{quote(filename, safe='')}"


_REDACT_PATTERNS = [
    (re.compile(r"(?i)((?:--?password|--?username|--?cookies|-u|-p)[= ]+)\S+"), r"\1***"),
    (re.compile(r"(?i)\b(cookie|authorization|set-cookie)(\s*[:=]\s*)[^\r\n]+"), r"\1\2***"),
    (re.compile(r"(?i)\b(user_session|SAPISID|__Secure-[0-9A-Za-z]+|SID|HSID|SSID|LOGIN_INFO|session|token|sig|signature)=([^&\s;]+)"), r"\1=***"),
]


def redact(text: str, secrets: list[str] | tuple[str, ...] = (), paths: list[str] | tuple[str, ...] = ()) -> str:
    """エラー詳細やログから秘密情報を取り除く。"""
    if not text:
        return ""
    for s in sorted({s for s in secrets if s and len(s) >= 3}, key=len, reverse=True):
        text = text.replace(s, "***")
    for p in paths:
        if p:
            text = text.replace(p, "<cookies>")
    for pat, rep in _REDACT_PATTERNS:
        text = pat.sub(rep, text)
    return text

"""取得不可の理由の分類ルール。

サイト側の文言が変わったら、このファイルの RULES にパターンを追記する。
上から順に評価し、最初に一致したルールを採用する（より具体的なものを上に置く）。

  patterns   : エラーメッセージに対する正規表現（大文字小文字は区別しない）
  exc_types  : yt-dlp の例外クラス名（メッセージが一致しなくても、これだけで決まる場合）
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field

# 分類キー
PRIVATE_DELETED = "private_deleted"
GEO = "geo_restricted"
LOGIN_REQUIRED = "login_required"
COOKIE_EXPIRED = "cookie_expired"
PAID_DRM = "paid_drm"
LIVE = "live"
BOT_BLOCK = "bot_block"
SITE_CHANGE = "site_change"
CONVERT_FAILED = "convert_failed"
DISK_FULL = "disk_full"
NETWORK = "network"
UNKNOWN = "unknown"

# 次にできること（フロントエンドがボタン・案内に変換する）
ACTION_NONE = "none"
ACTION_LOGIN_RETRY = "login_retry"        # 「ログインして再試行」。Cookie未設定なら設定画面へ
ACTION_RESET_COOKIE = "reset_cookie"      # 「Cookieを再設定」
ACTION_RETRY_LATER = "retry_after_live"   # 「配信終了後に再試行」
ACTION_AUTO_RETRY = "auto_retry"          # 時間を置いて自動再試行
ACTION_UPDATE_RETRY = "update_retry"      # 「yt-dlpを更新して再試行」
ACTION_RETRY = "retry"                    # 手動で再試行


@dataclass(frozen=True)
class Rule:
    category: str
    reason: str
    action: str
    hint: str = ""
    patterns: tuple[str, ...] = ()
    exc_types: tuple[str, ...] = ()
    retryable: bool = False          # 指数バックオフで自動再試行するか
    login_may_help: bool = False     # ログイン状態で再試行する価値があるか


RULES: tuple[Rule, ...] = (
    Rule(
        DISK_FULL, "サーバーの空き容量が足りません。", ACTION_NONE,
        hint="不要な完了ファイルを削除してから再試行してください。",
        patterns=(r"no space left on device", r"\bENOSPC\b", r"disk quota exceeded", r"not enough (free )?space"),
    ),
    Rule(
        COOKIE_EXPIRED, "Cookie期限切れ：再設定してください。", ACTION_RESET_COOKIE,
        hint="管理画面から新しい cookies.txt をアップロードしてください。",
        patterns=(
            r"cookies are no longer valid",
            r"cookies? (has|have) (expired|been rotated)",
            r"invalid session, re-?login required",
            r"unable to log ?in",
            r"invalid username (and/or|or) password",
            r"MFA (session expired|challenge failed)",
            r"login (failed|error)",
        ),
    ),
    Rule(
        PAID_DRM, "有料・メンバー限定・DRM（コピー防止技術）保護のため、取得対象外です。", ACTION_NONE,
        patterns=(
            r"DRM[ -]protected", r"\bDRM\b",
            r"members?[- ]only", r"join this channel", r"channel members",
            r"premium[- ](members )?only", r"premium members only", r"requires? (a )?(premium|subscription|payment|purchase)",
            r"\bpay[- ]per[- ]view\b", r"\bPPV\b", r"paid (video|content)", r"purchase(d)? (is )?required",
            r"this video requires payment", r"rental", r"有料", r"会員限定",
        ),
    ),
    Rule(
        LIVE, "ライブ配信中、またはプレミア公開前です。", ACTION_RETRY_LATER,
        hint="配信が終了してから再試行してください。",
        patterns=(
            r"premieres? in", r"live event will begin", r"this live (stream|event)", r"is (currently )?live",
            r"live stream(s)? (is|are) not supported", r"will begin in", r"offline", r"is upcoming",
            r"scheduled (for|to)", r"waiting for (the )?(live|premiere)",
        ),
    ),
    Rule(
        BOT_BLOCK, "ボット判定、または一時的なアクセス制限を受けています。", ACTION_AUTO_RETRY,
        hint="時間を置いて自動で再試行します。続く場合は、サーバーが自宅回線（VPSやクラウドではない）で動いているか確認してください。",
        patterns=(
            r"sign in to confirm (that )?you('|’)?re not a bot", r"not a bot",
            r"HTTP Error 429", r"too many requests", r"rate[- ]?limit", r"unusual traffic",
            r"captcha", r"temporarily (blocked|unavailable)", r"try again later",
            r"HTTP Error 403", r"access denied", r"your IP",
        ),
        retryable=True, login_may_help=True,
    ),
    Rule(
        LOGIN_REQUIRED, "ログインが必要な動画（年齢制限など）です。", ACTION_LOGIN_RETRY,
        hint="自分のアカウントのCookieを設定すると取得できる場合があります。",
        patterns=(
            r"sign in to confirm your age", r"age[- ]restricted", r"confirm your age", r"inappropriate for some users",
            r"login (is )?required", r"log ?in required", r"you have to be logged in", r"please (sign|log) in",
            r"use --cookies", r"--cookies-from-browser", r"only available (for|to) registered users",
            r"sensitive content", r"requires? (authentication|login|an account)", r"account (is )?required",
            r"ログインが必要",
        ),
        login_may_help=True,
    ),
    Rule(
        GEO, "地域制限のため、この地域からは取得できません。", ACTION_NONE,
        patterns=(
            r"not available (in|from) your (country|location|region)", r"geo[- ]?(restricted|blocked|restriction)",
            r"blocked (it )?in your country", r"available in your country", r"not available in your area",
            r"お住まいの地域",
        ),
        exc_types=("GeoRestrictedError",),
    ),
    Rule(
        PRIVATE_DELETED, "非公開、または削除済みの動画です。", ACTION_NONE,
        patterns=(
            r"private video", r"video (is )?(unavailable|private)", r"this video is (no longer )?(un)?available",
            r"has been (removed|deleted|terminated)", r"video unavailable", r"may not exist or was deleted",
            r"does not exist", r"no longer available", r"account (associated with this video )?has been terminated",
            r"removed by the (uploader|user)", r"copyright (claim|grounds)", r"HTTP Error 404", r"HTTP Error 410",
            r"community deleted or missing", r"削除され", r"非公開",
        ),
    ),
    Rule(
        CONVERT_FAILED, "変換（ffmpeg）に失敗しました。", ACTION_RETRY,
        hint="詳細に ffmpeg ログの末尾を表示しています。",
        patterns=(r"\bffmpeg\b.*(exited|failed|error)", r"postprocessing:", r"conversion failed", r"error opening (input|output)"),
        exc_types=("FFmpegError", "PostProcessingError", "FFmpegPostProcessorError"),
    ),
    Rule(
        SITE_CHANGE, "サイトの仕様変更の疑いがあります。", ACTION_UPDATE_RETRY,
        hint="yt-dlp を更新すると直ることがあります。",
        patterns=(
            r"unable to extract", r"signature extraction failed", r"n(sig)? (challenge|function|extraction)",
            r"challenge solv", r"js(i)? (runtime|challenge)", r"no (supported )?javascript runtime",
            r"failed to (extract|parse|decrypt)", r"could not find", r"unsupported url", r"no video formats found",
            r"requested format is not available", r"please report this issue", r"confirm you are on the latest version",
            r"player response", r"KeyError", r"JSONDecodeError", r"regexnotfound", r"API returned error status",
            r"nsig", r"SABR", r"po[_ ]?token",
        ),
        exc_types=("RegexNotFoundError", "UnsupportedError"),
        retryable=True,
    ),
    Rule(
        NETWORK, "ネットワークエラーが発生しました。", ACTION_AUTO_RETRY,
        hint="時間を置いて自動で再試行します。サーバーのネット接続を確認してください。",
        patterns=(
            r"timed? ?out", r"connection (reset|refused|aborted|error)", r"temporary failure in name resolution",
            r"name or service not known", r"getaddrinfo failed", r"network is unreachable", r"remote end closed",
            r"incomplete ?read", r"HTTP Error 5\d\d", r"ssl", r"transport ?error", r"unable to download (webpage|video data|json)",
            r"service temporarily unavailable", r"giving up after \d+ (fragment )?retries",
        ),
        exc_types=("TransportError", "HTTPError", "SSLError", "IncompleteRead", "TimeoutError", "ConnectionError"),
        retryable=True,
    ),
)

UNKNOWN_RULE = Rule(UNKNOWN, "不明なエラーが発生しました。", ACTION_RETRY, retryable=True)
_BY_CATEGORY = {r.category: r for r in RULES} | {UNKNOWN: UNKNOWN_RULE}

# 失敗はしなかったが、ログイン状態が無効だと分かる yt-dlp の警告
LOGIN_WARNING_PATTERNS = (
    r"cookies are no longer valid",
    r"unable to log ?in",
    r"invalid session, re-?login required",
)

_COMPILED = [(r, [re.compile(p, re.I) for p in r.patterns]) for r in RULES]
_COMPILED_WARN = [re.compile(p, re.I) for p in LOGIN_WARNING_PATTERNS]


@dataclass
class Classified:
    category: str
    reason: str
    action: str
    hint: str = ""
    detail: str = ""
    retryable: bool = False
    login_may_help: bool = False
    extra: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "category": self.category, "reason": self.reason, "action": self.action,
            "hint": self.hint, "detail": self.detail, **self.extra,
        }


def rule_for(category: str) -> Rule:
    return _BY_CATEGORY.get(category, UNKNOWN_RULE)


def from_category(category: str, detail: str = "", **extra) -> Classified:
    r = rule_for(category)
    return Classified(r.category, r.reason, r.action, r.hint, detail, r.retryable, r.login_may_help, dict(extra))


def classify(message: str, exc_type: str = "", *, used_login: bool = False) -> Classified:
    """例外の種類とメッセージから分類する。

    used_login=True（ログイン状態で試した）のに「ログインが必要」と言われた場合は、
    Cookie が無効になっていると判断して cookie_expired に読み替える。
    """
    message = message or ""
    found: Rule | None = None
    for rule, patterns in _COMPILED:
        if any(p.search(message) for p in patterns):
            found = rule
            break
    if found is None:
        for rule, _ in _COMPILED:
            if exc_type and exc_type in rule.exc_types:
                found = rule
                break
    if found is None:
        found = UNKNOWN_RULE
    if used_login and found.category == LOGIN_REQUIRED:
        found = rule_for(COOKIE_EXPIRED)
    return Classified(found.category, found.reason, found.action, found.hint, message,
                      found.retryable, found.login_may_help)


def login_warning(warnings: list[str] | tuple[str, ...]) -> str | None:
    """yt-dlp の警告の中に「ログイン状態が無効」を示すものがあれば、その文を返す。"""
    for w in warnings or ():
        if any(p.search(w) for p in _COMPILED_WARN):
            return w
    return None

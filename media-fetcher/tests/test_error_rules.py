import pytest

from app import error_rules as er

# (分類, 例外の種類, 実際に出るメッセージの例)
CASES = [
    (er.PRIVATE_DELETED, "ExtractorError", "[youtube] abc: Private video. Sign in if you've been granted access to this video"),
    (er.PRIVATE_DELETED, "ExtractorError", "[youtube] abc: Video unavailable. This video has been removed by the uploader"),
    (er.PRIVATE_DELETED, "ExtractorError", "[niconico] sm1: Video unavailable, may not exist or was deleted"),
    (er.PRIVATE_DELETED, "HTTPError", "[generic] Unable to download webpage: HTTP Error 404: Not Found"),
    (er.GEO, "GeoRestrictedError", "[youtube] abc: The uploader has not made this video available in your country"),
    (er.GEO, "GeoRestrictedError", "This content is not available from your location"),
    (er.GEO, "GeoRestrictedError", "some new wording nobody has seen yet"),
    (er.LOGIN_REQUIRED, "ExtractorError", "[youtube] abc: Sign in to confirm your age. This video may be inappropriate for some users."),
    (er.LOGIN_REQUIRED, "ExtractorError", "[niconico] sm1: Login is required to access age-restricted content"),
    (er.LOGIN_REQUIRED, "ExtractorError", "[niconico] sm1: Sensitive content, login required"),
    (er.LOGIN_REQUIRED, "ExtractorError", "This video is only available for registered users. Use --cookies-from-browser or --cookies"),
    (er.COOKIE_EXPIRED, "ExtractorError", "The provided YouTube account cookies are no longer valid. They have likely been rotated"),
    (er.COOKIE_EXPIRED, "ExtractorError", "[niconico] Unable to login: Invalid username or password"),
    (er.COOKIE_EXPIRED, "ExtractorError", "[niconico] sm1: Invalid session, re-login required"),
    (er.PAID_DRM, "ExtractorError", "[youtube] abc: Join this channel to get access to members-only content like this video"),
    (er.PAID_DRM, "ExtractorError", "[niconico] sm1: Premium members only"),
    (er.PAID_DRM, "ExtractorError", "This video is DRM protected"),
    (er.PAID_DRM, "ExtractorError", "[youtube] abc: This video requires payment to watch"),
    (er.LIVE, "ExtractorError", "[youtube] abc: Premieres in 3 hours"),
    (er.LIVE, "ExtractorError", "[youtube] abc: This live event will begin in 25 minutes."),
    (er.LIVE, "Live", "This video is currently live"),
    (er.BOT_BLOCK, "ExtractorError", "[youtube] abc: Sign in to confirm you’re not a bot. Use --cookies-from-browser or --cookies"),
    (er.BOT_BLOCK, "HTTPError", "Unable to download webpage: HTTP Error 429: Too Many Requests"),
    (er.BOT_BLOCK, "ExtractorError", "Your account has been rate-limited by YouTube for up to an hour"),
    (er.BOT_BLOCK, "HTTPError", "unable to download video data: HTTP Error 403: Forbidden"),
    (er.SITE_CHANGE, "RegexNotFoundError", "[youtube] abc: Unable to extract initial player response; please report this issue on https://github.com/yt-dlp"),
    (er.SITE_CHANGE, "ExtractorError", "[youtube] abc: Signature extraction failed: Some formats may be missing"),
    (er.SITE_CHANGE, "ExtractorError", "[youtube] abc: n challenge solving failed: no JavaScript runtime available"),
    (er.SITE_CHANGE, "ExtractorError", "Requested format is not available. Use --list-formats for a list of available formats"),
    (er.SITE_CHANGE, "UnsupportedError", "Unsupported URL: https://example.com/"),
    (er.CONVERT_FAILED, "PostProcessingError", "Postprocessing: Conversion failed!"),
    (er.CONVERT_FAILED, "FFmpegError", "anything"),
    (er.DISK_FULL, "OSError", "[Errno 28] No space left on device"),
    (er.NETWORK, "TransportError", "Unable to download webpage: [Errno -3] Temporary failure in name resolution"),
    (er.NETWORK, "TransportError", "The read operation timed out"),
    (er.NETWORK, "HTTPError", "HTTP Error 503: Service Unavailable"),
    (er.UNKNOWN, "ValueError", "something nobody anticipated"),
]


@pytest.mark.parametrize("category,exc_type,message", CASES)
def test_classification(category, exc_type, message):
    c = er.classify(message, exc_type)
    assert c.category == category, f"{message!r} → {c.category}"
    assert c.reason and "\n" not in c.reason        # 理由は日本語1行
    assert c.detail == message                      # 元のメッセージは詳細に残る


def test_every_category_has_an_example():
    assert {c for c, _, _ in CASES} == {r.category for r in er.RULES} | {er.UNKNOWN}


def test_actions():
    act = lambda m, t="ExtractorError": er.classify(m, t).action
    assert act("Private video") == er.ACTION_NONE
    assert act("not available in your country") == er.ACTION_NONE
    assert act("Sign in to confirm your age") == er.ACTION_LOGIN_RETRY
    assert act("cookies are no longer valid") == er.ACTION_RESET_COOKIE
    assert act("This video is DRM protected") == er.ACTION_NONE
    assert act("Premieres in 2 hours") == er.ACTION_RETRY_LATER
    assert act("Sign in to confirm you're not a bot") == er.ACTION_AUTO_RETRY
    assert act("Unable to extract player") == er.ACTION_UPDATE_RETRY
    assert act("???") == er.ACTION_RETRY


def test_retry_and_login_flags():
    assert er.classify("Sign in to confirm you're not a bot").retryable
    assert er.classify("Sign in to confirm you're not a bot").login_may_help
    assert er.classify("Sign in to confirm your age").login_may_help
    assert not er.classify("Sign in to confirm your age").retryable
    for msg in ("Private video", "not available in your country", "This video is DRM protected", "Premieres in 1 hour"):
        c = er.classify(msg)
        assert not c.retryable and not c.login_may_help


def test_login_required_while_logged_in_means_cookie_expired():
    c = er.classify("Sign in to confirm your age", used_login=True)
    assert c.category == er.COOKIE_EXPIRED and c.action == er.ACTION_RESET_COOKIE


def test_login_warning_detection():
    assert er.login_warning(["foo", "The provided YouTube account cookies are no longer valid."])
    assert er.login_warning(["just a deprecation notice"]) is None

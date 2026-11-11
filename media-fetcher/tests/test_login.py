import os
import stat

import pytest

from app import login as lg
from app.downloader.adapters import adapter
from app.downloader.base import DownloadFailed
from conftest import COOKIE_EXPIRED, COOKIE_OK, run

AGE = "Sign in to confirm your age. This video may be inappropriate for some users."
BOT = "Sign in to confirm you're not a bot"


def scripted(script):
    """呼ばれるたびに script の先頭を消費する取得関数と、渡された認証の記録を返す。"""
    seen = []

    async def fn(auth):
        seen.append(auth is not None)
        item = script.pop(0)
        if isinstance(item, Exception):
            raise item
        return item

    return fn, seen


class Result:
    def __init__(self, warnings=()):
        self.warnings = list(warnings)


def test_defaults(lm):
    assert lm.mode("youtube") == "on_failure"
    assert lm.mode("niconico") == "always"
    assert lm.mode("generic") == "never"
    assert lm.status("youtube")["status"] == "unset"


def test_on_failure_tries_anonymous_first_and_does_not_login_when_it_works(lm):
    lm.save_cookie("youtube", COOKIE_OK)
    fn, seen = scripted([Result()])
    _, outcome = run(lg.run_with_login_policy(lm, "youtube", fn))
    assert seen == [False] and outcome.used_login is False


@pytest.mark.parametrize("message", [AGE, BOT, "Login required: use --cookies"])
def test_on_failure_retries_with_login_automatically(lm, message):
    lm.save_cookie("youtube", COOKIE_OK)
    fn, seen = scripted([DownloadFailed(message, "ExtractorError"), Result()])
    _, outcome = run(lg.run_with_login_policy(lm, "youtube", fn))
    assert seen == [False, True]                       # 未ログイン → ログインあり
    assert outcome.used_login and outcome.retried_with_login
    assert lm.status("youtube")["status"] == "valid"


@pytest.mark.parametrize("message", ["Private video", "not available in your country", "This video is DRM protected",
                                     "Unable to extract player response"])
def test_on_failure_does_not_login_for_unrelated_errors(lm, message):
    lm.save_cookie("youtube", COOKIE_OK)
    fn, seen = scripted([DownloadFailed(message, "ExtractorError")])
    with pytest.raises(DownloadFailed) as e:
        run(lg.run_with_login_policy(lm, "youtube", fn))
    assert seen == [False] and e.value.used_login is False


def test_on_failure_without_credentials_fails_without_retry(lm):
    fn, seen = scripted([DownloadFailed(AGE, "ExtractorError")])
    with pytest.raises(DownloadFailed):
        run(lg.run_with_login_policy(lm, "youtube", fn))
    assert seen == [False]


def test_login_retry_that_still_fails_marks_cookie_expired(lm):
    lm.save_cookie("youtube", COOKIE_OK)
    fn, seen = scripted([DownloadFailed(AGE, "ExtractorError"), DownloadFailed(AGE, "ExtractorError")])
    with pytest.raises(DownloadFailed) as e:
        run(lg.run_with_login_policy(lm, "youtube", fn))
    assert seen == [False, True] and e.value.used_login is True
    assert lm.status("youtube")["status"] == "expired"
    assert lm.banners()[0]["message"] == "YouTube：Cookie期限切れ：再設定してください"


def test_always_mode_logs_in_from_the_start(lm, settings):
    settings.niconico_username, settings.niconico_password = "me@example.com", "pw-secret"
    fn, seen = scripted([Result()])
    _, outcome = run(lg.run_with_login_policy(lm, "niconico", fn))
    assert seen == [True] and outcome.used_login


def test_always_mode_without_credentials_runs_anonymous(lm):
    fn, seen = scripted([Result()])
    _, outcome = run(lg.run_with_login_policy(lm, "niconico", fn))
    assert seen == [False] and not outcome.used_login


def test_never_mode_never_logs_in(lm):
    lm.save_cookie("youtube", COOKIE_OK)
    lm.set_mode("youtube", "never")
    fn, seen = scripted([DownloadFailed(AGE, "ExtractorError")])
    with pytest.raises(DownloadFailed):
        run(lg.run_with_login_policy(lm, "youtube", fn, force_login=True))
    assert seen == [False]


def test_force_login_uses_login_first(lm):
    lm.save_cookie("youtube", COOKIE_OK)
    fn, seen = scripted([Result()])
    run(lg.run_with_login_policy(lm, "youtube", fn, force_login=True))
    assert seen == [True]


def test_warning_about_invalid_cookies_marks_expired_even_on_success(lm):
    lm.save_cookie("youtube", COOKIE_OK)
    fn, _ = scripted([Result(["The provided YouTube account cookies are no longer valid."])])
    run(lg.run_with_login_policy(lm, "youtube", fn, force_login=True))
    assert lm.status("youtube")["status"] == "expired"


def test_cookie_file_is_saved_with_mode_600_and_niconico_prefers_cookie(lm, settings):
    lm.save_cookie("youtube", COOKIE_OK)
    path = lm.cookie_path("youtube")
    assert stat.S_IMODE(os.stat(path).st_mode) == 0o600
    assert lm.auth("youtube").method == "cookies"
    settings.niconico_username, settings.niconico_password = "me@example.com", "pw"
    assert lm.auth("niconico").method == "password"
    lm.save_cookie("niconico", ".nicovideo.jp\tTRUE\t/\tTRUE\t4102444800\tuser_session\tabc\n")
    assert lm.auth("niconico").method == "cookies"


def test_cookie_validation_and_static_status(lm):
    with pytest.raises(lg.CookieFileError):
        lm.save_cookie("youtube", "this is not a cookie file")
    with pytest.raises(lg.CookieFileError):
        lm.save_cookie("youtube", "# Netscape HTTP Cookie File\n")
    yt = adapter("youtube")
    assert lg.static_cookie_status(COOKIE_OK, yt)[0] == "valid"
    assert lg.static_cookie_status(COOKIE_EXPIRED, yt)[0] == "expired"
    assert lg.static_cookie_status(".example.com\tTRUE\t/\tTRUE\t4102444800\tx\ty\n", yt)[0] == "expired"
    assert lg.static_cookie_status(".youtube.com\tTRUE\t/\tTRUE\t4102444800\tPREF\ty\n", yt)[0] == "expired"
    status, _ = lm.save_cookie("youtube", COOKIE_EXPIRED)
    assert status == "expired" and lm.status("youtube")["status"] == "expired"
    lm.delete_cookie("youtube")
    assert lm.status("youtube")["status"] == "unset" and not lm.banners()

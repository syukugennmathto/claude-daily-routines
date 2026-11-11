import pytest

from app.security import UrlRejected, content_disposition, redact, safe_child, sanitize_filename, validate_url


@pytest.mark.parametrize("url", [
    "https://www.youtube.com/watch?v=abc", "http://example.com/a.mp4", "https://www.nicovideo.jp/watch/sm9",
    "https://example.com:443/x", "https://8.8.8.8/x",
])
def test_valid_urls(url):
    assert validate_url(url) == url


@pytest.mark.parametrize("url", [
    "", "ftp://example.com/a", "file:///etc/passwd", "/etc/passwd", "javascript:alert(1)", "example.com/video",
    "http://localhost/", "http://localhost:8080/x", "http://127.0.0.1/", "http://127.1/", "http://2130706433/",
    "http://0x7f.0.0.1/", "http://10.0.0.5/x", "http://192.168.1.1/", "http://172.16.0.1/", "http://169.254.169.254/latest",
    "http://[::1]/", "http://[fe80::1]/", "http://[::ffff:127.0.0.1]/", "http://100.64.0.1/", "http://0.0.0.0/",
    "http://nas/", "http://router.local/", "http://db.internal/", "http://user:pass@example.com/",
    "https://example.com:22/", "https://exa mple.com/", "http://example.com/\nx", "https://",
])
def test_rejected_urls(url):
    with pytest.raises(UrlRejected):
        validate_url(url)


def test_dns_resolving_to_private_address_is_rejected():
    private = lambda host, port: [(2, 1, 6, "", ("192.168.0.10", 0))]
    public = lambda host, port: [(2, 1, 6, "", ("93.184.216.34", 0))]
    with pytest.raises(UrlRejected):
        validate_url("https://evil.example.com/", resolve=True, resolver=private)
    assert validate_url("https://ok.example.com/", resolve=True, resolver=public)


def test_sanitize_filename_keeps_japanese_and_blocks_traversal():
    assert sanitize_filename("歌ってみた／テスト: 第1話?", "mp3") == "歌ってみた／テスト_ 第1話_.mp3"
    name = sanitize_filename("../../etc/passwd", "mp4")
    assert "/" not in name and "\\" not in name and not name.startswith(".")
    assert sanitize_filename("", "wav") == "download.wav"
    assert sanitize_filename("CON", "mp3") == "download.mp3"
    assert sanitize_filename("a\x00b\nc", "mp3") == "abc.mp3"
    assert len(sanitize_filename("あ" * 500, "mp4").encode()) <= 190


def test_safe_child(tmp_path):
    assert safe_child(tmp_path, "a.mp3") == tmp_path.resolve() / "a.mp3"
    for bad in ("../x", "/etc/passwd", "a/../../x", "."):
        with pytest.raises(ValueError):
            safe_child(tmp_path, bad)


def test_content_disposition_rfc5987():
    v = content_disposition("日本語の曲 (1).mp3")
    assert v.startswith('attachment; filename="')
    assert "filename*=UTF-8''%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E6%9B%B2%20%281%29.mp3" in v
    v.encode("latin-1")   # ヘッダーとして送れること
    assert '"' not in content_disposition('a"b.mp3').split("filename*=")[0].replace('filename="', "").rstrip('"; ')


def test_redact_hides_secrets():
    text = "login failed for user@example.com with --password hunter2secret; Cookie: SID=abcdef; path /data/cookies/youtube.txt"
    out = redact(text, ["hunter2secret", "user@example.com"], ["/data/cookies/youtube.txt"])
    assert "hunter2secret" not in out and "user@example.com" not in out and "abcdef" not in out
    assert "/data/cookies" not in out

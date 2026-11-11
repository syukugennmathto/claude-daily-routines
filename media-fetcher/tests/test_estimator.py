import pytest

from app import estimator as est
from app.formats import Preset, format_selector, parse_preset

MBPS = est.mbps_to_bps
RATES = est.Rates(download_bps=MBPS(40), overhead_s=5, transfer_bps=MBPS(20),
                  conv_rate={"mp3": 30, "wav": 300, "mp4_merge": 100, "mp4_reencode": 2},
                  learned={"download": True, "transfer": True})
V_H264 = {"format_id": "137", "vcodec": "avc1.640028", "acodec": "none", "height": 1080, "width": 1920}
AUDIO = {"format_id": "140", "vcodec": "none", "acodec": "mp4a.40.2", "asr": 44100, "audio_channels": 2}


def test_size_uses_filesize_first():
    assert est.one_format_size({"filesize": 100, "filesize_approx": 200, "tbr": 999}, 60) == (100, "filesize")


def test_size_falls_back_to_filesize_approx():
    assert est.one_format_size({"filesize": None, "filesize_approx": 200, "tbr": 999}, 60) == (200, "filesize_approx")


def test_size_falls_back_to_bitrate_times_duration():
    assert est.one_format_size({"tbr": 800}, 60) == (800 * 1000 // 8 * 60, "bitrate")


def test_size_unknown_uses_assumed_bitrate():
    size, basis = est.source_size([{"format_id": "x"}], 100, "mp4:720")
    assert basis == "assumed" and size == est.FALLBACK_KBPS["mp4:720"] * 1000 // 8 * 100
    assert est.source_size([], 100, "audio")[1] == "assumed"
    assert est.source_size([{"tbr": 500}], None, "audio")[1] == "assumed"   # 長さ不明でも落ちない


def test_mp4_source_is_video_plus_audio_and_basis_is_the_weakest():
    size, basis = est.source_size([{**V_H264, "filesize": 50_000_000}, {**AUDIO, "tbr": 128}], 100, "mp4:1080")
    assert size == 50_000_000 + 128 * 1000 // 8 * 100
    assert basis == "bitrate"


def test_output_sizes():
    assert est.output_size(Preset("mp3", "320"), [AUDIO], 100, 1) == 320_000 // 8 * 100
    assert est.output_size(Preset("wav", ""), [AUDIO], 100, 1) == 44100 * 16 * 2 // 8 * 100
    assert est.output_size(Preset("wav", ""), [{"acodec": "opus"}], 100, 1) == int(1411.2 * 1000 / 8 * 100)
    assert est.output_size(Preset("mp4", "720"), [V_H264, AUDIO], 100, 12345) == 12345


def test_total_is_wait_plus_fetch_plus_convert_plus_transfer():
    fmts = [{**V_H264, "filesize": 50_000_000}, {**AUDIO, "filesize": 10_000_000}]
    e = est.estimate(Preset("mp4", "1080"), fmts, 200, RATES, wait_s=30)
    assert e.fetch_s == pytest.approx(60_000_000 / MBPS(40) + 5)        # サイズ÷速度＋固定オーバーヘッド
    assert e.convert_s == pytest.approx(200 / 100)                      # 長さ÷倍率
    assert e.transfer_s == pytest.approx(60_000_000 / MBPS(20))
    assert e.total_s == pytest.approx(30 + e.fetch_s + e.convert_s + e.transfer_s)
    assert not e.reencode and e.low_s < e.total_s < e.high_s


def test_mp3_estimate():
    e = est.estimate(Preset("mp3", "192"), [{**AUDIO, "filesize": 4_000_000}], 240, RATES)
    assert e.convert_s == pytest.approx(240 / 30)
    assert e.output_bytes == 192_000 // 8 * 240


def test_reencode_is_flagged_and_much_slower():
    vp9 = {"format_id": "248", "vcodec": "vp09.00.40.08", "acodec": "none", "height": 1080, "width": 1920, "filesize": 50_000_000}
    e = est.estimate(Preset("mp4", "1080"), [vp9, {**AUDIO, "filesize": 1}], 200, RATES)
    assert e.reencode
    assert e.convert_s == pytest.approx(200 / 2 * (1920 * 1080) / (1280 * 720))   # 画素数で補正
    plain = est.estimate(Preset("mp4", "1080"), [{**V_H264, "filesize": 50_000_000}, {**AUDIO, "filesize": 1}], 200, RATES)
    assert e.convert_s > plain.convert_s * 20


def test_unknown_codec_is_not_treated_as_reencode():
    assert not est.needs_reencode([{"vcodec": None}, {"vcodec": "none"}])


def test_range_is_wider_without_measurements_and_for_weak_basis():
    fmts = [{**AUDIO, "filesize": 4_000_000}]
    cold = est.Rates(MBPS(30), 8, MBPS(20))
    a, b = est.estimate(Preset("mp3", "192"), fmts, 240, RATES), est.estimate(Preset("mp3", "192"), fmts, 240, cold)
    assert b.high_s / b.total_s > a.high_s / a.total_s
    weak = est.estimate(Preset("mp3", "192"), [{"format_id": "x"}], 240, RATES)
    assert weak.high_s / weak.total_s > a.high_s / a.total_s and weak.size_basis == "assumed"


def test_moving_average_uses_latest_five_and_default():
    assert est.moving_average([], 7) == 7
    assert est.moving_average([10, 20, 30, 40, 50, 1000], 7) == 30
    assert est.moving_average([0, None, 10], 7) == 10


def test_queue_wait():
    assert est.queue_wait([], 5) == 0
    assert est.queue_wait([60, 40], 5) == 60 + 40 + 5 * 2
    assert est.queue_wait([60, 40], 5, concurrency=2) == (60 + 40 + 10) / 2


def test_japanese_text():
    e = est.Estimate(1, 1, "filesize", False, fetch_s=40, convert_s=10, transfer_s=90, low_s=120, high_s=240)
    assert est.format_ja(e) == "約2分（取得40秒・変換10秒・スマホへ2分） 目安 2分〜4分"
    assert est.format_ja(e).startswith("約")
    e.wait_s = 120
    assert "待ち2分" in est.format_ja(e)
    assert est.format_duration_ja(3) == "3秒" and est.format_duration_ja(3725) == "1時間2分"


def test_error_ratio():
    assert est.error_ratio(120, 100) == pytest.approx(0.2)
    assert est.error_ratio(None, 100) is None and est.error_ratio(10, 0) is None


def test_format_selector_prefers_h264_then_falls_back():
    s = format_selector("mp4:720")
    parts = s.split("/")
    assert parts[0] == "bv*[vcodec^=avc1][height<=720]+ba[acodec^=mp4a]"
    assert parts[-1] == "b" and "bv*[height<=720]+ba" in parts       # 希望 → 次善 → 取れる範囲
    assert "height" not in format_selector("mp4:best")
    assert format_selector("audio").startswith("bestaudio")


def test_parse_preset():
    assert parse_preset("MP3", "320k").key == "mp3:320"
    assert parse_preset("mp4", "720p").key == "mp4:720"
    assert parse_preset("mp4", None).quality == "best"
    assert parse_preset("wav", "anything").key == "wav"
    for bad in (("mp3", "999"), ("mp4", "4k"), ("flac", "")):
        with pytest.raises(ValueError):
            parse_preset(*bad)


def test_unknown_duration_is_low_confidence_and_excluded_from_guessing():
    e = est.estimate(Preset("mp3", "192"), [{"filesize": 5_000_000}], None, RATES)
    assert e.size_basis == "assumed" and e.convert_s == 0 and e.output_bytes == 5_000_000
    assert e.high_s / e.total_s >= 2.5

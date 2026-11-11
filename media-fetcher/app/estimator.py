"""所要時間の見積もり。

総所要時間 ＝ 待ち時間 ＋ 取得時間 ＋ 変換時間 ＋ スマホへの転送時間

このモジュールは DB に依存しない純粋関数だけで構成する。実測値（Rates）は
呼び出し側が DB の samples テーブルから移動平均を作って渡す。
"""
from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field

from .formats import Preset, is_aac, is_h264

MOVING_AVERAGE_N = 5
WAV_DEFAULT_KBPS = 1411.2          # 16bit / 44.1kHz / ステレオ
REENCODE_REF_PIXELS = 1280 * 720   # 再エンコード倍率は 720p 相当に正規化して学習する

# サイズ情報が一切ないときの仮定ビットレート(kbps)。あくまで最後の手段。
FALLBACK_KBPS = {"audio": 130, "mp4:480": 900, "mp4:720": 1800, "mp4:1080": 3500, "mp4:best": 3500}

# 実績が無いときの変換速度倍率（実時間の何倍速か）。初回ベンチマークで上書きされる。
DEFAULT_CONV_RATE = {"mp3": 40.0, "wav": 200.0, "mp4_merge": 150.0, "mp4_reencode": 2.0}


@dataclass
class Rates:
    """見積もりに使う速度・倍率（サイト別の移動平均、または既定値）。"""
    download_bps: float                 # 取得速度 [バイト/秒]
    overhead_s: float                   # メタデータ取得・JSチャレンジの固定オーバーヘッド [秒]
    transfer_bps: float                 # スマホへの転送速度 [バイト/秒]
    conv_rate: dict[str, float] = field(default_factory=lambda: dict(DEFAULT_CONV_RATE))
    learned: dict[str, bool] = field(default_factory=dict)   # 実測に基づく値かどうか


@dataclass
class Estimate:
    source_bytes: int
    output_bytes: int
    size_basis: str          # filesize / filesize_approx / bitrate / assumed
    reencode: bool
    fetch_s: float
    convert_s: float
    transfer_s: float
    wait_s: float = 0.0
    low_s: float = 0.0
    high_s: float = 0.0

    @property
    def total_s(self) -> float:
        return self.wait_s + self.fetch_s + self.convert_s + self.transfer_s

    @property
    def server_s(self) -> float:
        return self.fetch_s + self.convert_s

    def to_dict(self) -> dict:
        d = asdict(self)
        d["total_s"] = self.total_s
        d["text"] = format_ja(self)
        return d


def mbps_to_bps(mbps: float) -> float:
    return mbps * 1_000_000 / 8


def moving_average(values: list[float], default: float, n: int = MOVING_AVERAGE_N) -> float:
    """新しい順に並んだ実測値の直近 n 件の平均。実績が無ければ default。"""
    vals = [v for v in values[:n] if v and v > 0 and math.isfinite(v)]
    return sum(vals) / len(vals) if vals else default


def one_format_size(fmt: dict, duration: float | None) -> tuple[int | None, str]:
    """1つのストリームのサイズ。filesize → filesize_approx → tbr×長さ の順で使う。"""
    if fmt.get("filesize"):
        return int(fmt["filesize"]), "filesize"
    if fmt.get("filesize_approx"):
        return int(fmt["filesize_approx"]), "filesize_approx"
    kbps = fmt.get("tbr") or ((fmt.get("vbr") or 0) + (fmt.get("abr") or 0))
    if kbps and duration:
        return int(kbps * 1000 / 8 * duration), "bitrate"
    return None, "assumed"


_BASIS_RANK = {"filesize": 0, "filesize_approx": 1, "bitrate": 2, "assumed": 3}


def source_size(formats: list[dict], duration: float | None, selection: str) -> tuple[int, str]:
    """取得サイズ（MP4は映像＋音声の合計）と、その根拠（最も信頼度の低いもの）。"""
    total, worst = 0, "filesize"
    if not formats:
        worst = "assumed"
    for f in formats:
        size, basis = one_format_size(f, duration)
        if size is None:
            return int(FALLBACK_KBPS.get(selection, 2000) * 1000 / 8 * (duration or 0)), "assumed"
        total += size
        if _BASIS_RANK[basis] > _BASIS_RANK[worst]:
            worst = basis
    if not formats:
        total = int(FALLBACK_KBPS.get(selection, 2000) * 1000 / 8 * (duration or 0))
    return total, worst


def needs_reencode(formats: list[dict]) -> bool:
    """MP4 で H.264 が取れておらず、再エンコードが必要か。不明なら不要とみなす。"""
    return any(is_h264(f.get("vcodec")) is False for f in formats)


def output_size(preset: Preset, formats: list[dict], duration: float | None, src_bytes: int) -> int:
    d = duration or 0
    if not d:
        return src_bytes       # 長さ不明のときは取得サイズで代用する
    if preset.kind == "mp3":
        return int(int(preset.quality) * 1000 / 8 * d)
    if preset.kind == "wav":
        audio = next((f for f in formats if (f.get("acodec") or "none") != "none"), {})
        asr, ch = audio.get("asr"), audio.get("audio_channels")
        kbps = (asr * 16 * (ch or 2) / 1000) if asr else WAV_DEFAULT_KBPS
        return int(kbps * 1000 / 8 * d)
    return src_bytes   # MP4 は取得サイズとほぼ同じ


def convert_seconds(preset: Preset, formats: list[dict], duration: float | None, rates: Rates) -> tuple[float, bool]:
    """変換時間 ＝ 動画の長さ ÷ 変換速度倍率。MP4 の再エンコードは画素数で補正する。"""
    d = duration or 0
    rate = rates.conv_rate
    if preset.kind in ("mp3", "wav"):
        return d / max(rate.get(preset.kind, DEFAULT_CONV_RATE[preset.kind]), 0.01), False
    if needs_reencode(formats):
        v = next((f for f in formats if is_h264(f.get("vcodec")) is False), {})
        pixels = (v.get("width") or 0) * (v.get("height") or 0)
        if not pixels and v.get("height"):
            pixels = v["height"] * v["height"] * 16 / 9
        scale = (pixels / REENCODE_REF_PIXELS) if pixels else 1.0
        r = max(rate.get("mp4_reencode", DEFAULT_CONV_RATE["mp4_reencode"]), 0.01)
        return d / r * max(scale, 0.1), True
    t = d / max(rate.get("mp4_merge", DEFAULT_CONV_RATE["mp4_merge"]), 0.01)
    audio = next((f for f in formats if (f.get("acodec") or "none") != "none"), None)
    if audio is not None and is_aac(audio.get("acodec")) is False:
        # 音声だけ AAC に変換する（MP3 エンコードと同程度の重さ）
        t += d / max(rate.get("mp3", DEFAULT_CONV_RATE["mp3"]), 0.01)
    return t, False


# 根拠ごとの見積もり幅（下限係数, 上限係数）
_SPREAD = {"filesize": (0.7, 1.5), "filesize_approx": (0.65, 1.6), "bitrate": (0.6, 1.8), "assumed": (0.4, 2.5)}


def estimate(preset: Preset, formats: list[dict], duration: float | None, rates: Rates, wait_s: float = 0.0) -> Estimate:
    src, basis = source_size(formats, duration, preset.selection)
    if not duration:
        basis = "assumed"      # 長さ不明：変換時間・完成サイズを計算できないので、目安の幅を広げる
    fetch = src / max(rates.download_bps, 1) + rates.overhead_s
    conv, reenc = convert_seconds(preset, formats, duration, rates)
    out = output_size(preset, formats, duration, src)
    xfer = out / max(rates.transfer_bps, 1)
    est = Estimate(src, out, basis, reenc, fetch, conv, xfer, wait_s)
    lo, hi = _SPREAD[basis]
    if not all(rates.learned.get(k) for k in ("download", "transfer")):
        lo, hi = lo * 0.85, hi * 1.25      # 実績が無いうちは幅を広げる
    if reenc:
        hi *= 1.3                          # 再エンコードは内容による振れが大きい
    est.low_s = est.total_s * lo
    est.high_s = est.total_s * hi
    return est


def queue_wait(remaining_before: list[float], gap_avg: float, concurrency: int = 1) -> float:
    """待ち時間 ＝ 前にあるジョブの残り見積もりの合計 ＋ ジョブ間の待機秒数。"""
    if not remaining_before:
        return 0.0
    c = max(1, concurrency)
    return (sum(remaining_before) + gap_avg * len(remaining_before)) / c


def format_duration_ja(seconds: float) -> str:
    s = max(0, float(seconds))
    if s < 55:
        return f"{max(1, int(round(s / 5) * 5) if s >= 10 else int(math.ceil(s)))}秒"
    m = s / 60
    if m < 60:
        return f"{int(round(m))}分" if m >= 1.5 else "1分"
    h, mm = divmod(int(round(m)), 60)
    return f"{h}時間{mm}分" if mm else f"{h}時間"


def format_ja(est: Estimate) -> str:
    """例: 約3分（取得40秒・変換10秒・スマホへ90秒）目安 2〜4分"""
    parts = []
    if est.wait_s >= 1:
        parts.append(f"待ち{format_duration_ja(est.wait_s)}")
    parts += [f"取得{format_duration_ja(est.fetch_s)}", f"変換{format_duration_ja(est.convert_s)}",
              f"スマホへ{format_duration_ja(est.transfer_s)}"]
    text = f"約{format_duration_ja(est.total_s)}（{'・'.join(parts)}）"
    lo, hi = format_duration_ja(est.low_s), format_duration_ja(est.high_s)
    if lo != hi:
        text += f" 目安 {lo}〜{hi}"
    return text


def format_size_ja(n: float | None) -> str:
    if not n:
        return "不明"
    for unit, div in (("GB", 1 << 30), ("MB", 1 << 20), ("KB", 1 << 10)):
        if n >= div:
            v = n / div
            return f"{v:.1f}{unit}" if v < 100 else f"{v:.0f}{unit}"
    return f"{int(n)}B"


def error_ratio(estimated: float | None, actual: float | None) -> float | None:
    """見積もりと実測の差（実測に対する割合。+は見積もりが長すぎ）。"""
    if not estimated or not actual or actual <= 0:
        return None
    return (estimated - actual) / actual

"""出力形式のプリセットと、「希望画質 → 次善」のフォーマット指定。"""
from __future__ import annotations

from dataclasses import dataclass

MP3_BITRATES = (128, 192, 320)
MP4_QUALITIES = ("best", "1080", "720", "480")


@dataclass(frozen=True)
class Preset:
    kind: str       # mp3 / wav / mp4
    quality: str    # mp3: 128/192/320, wav: "", mp4: best/1080/720/480

    @property
    def key(self) -> str:
        return f"{self.kind}:{self.quality}" if self.quality else self.kind

    @property
    def selection(self) -> str:
        """取得する素材の選び方。音声系は共通。"""
        return "audio" if self.kind in ("mp3", "wav") else f"mp4:{self.quality}"

    @property
    def label(self) -> str:
        if self.kind == "mp3":
            return f"MP3 {self.quality}kbps"
        if self.kind == "wav":
            return "WAV（無劣化）"
        return "MP4 最高画質" if self.quality == "best" else f"MP4 {self.quality}p"

    @property
    def ext(self) -> str:
        return self.kind


ALL_PRESETS: tuple[Preset, ...] = (
    *(Preset("mp3", str(b)) for b in MP3_BITRATES),
    Preset("wav", ""),
    *(Preset("mp4", q) for q in MP4_QUALITIES),
)


def parse_preset(kind: str, quality: str | None) -> Preset:
    kind = (kind or "").lower()
    quality = str(quality or "").lower().removesuffix("p").removesuffix("k")
    if kind == "mp3":
        quality = quality or "192"
        if quality not in map(str, MP3_BITRATES):
            raise ValueError("MP3のビットレートは 128 / 192 / 320 から選んでください。")
    elif kind == "wav":
        quality = ""
    elif kind == "mp4":
        quality = quality or "best"
        if quality not in MP4_QUALITIES:
            raise ValueError("MP4の画質は 最高 / 1080p / 720p / 480p から選んでください。")
    else:
        raise ValueError("形式は MP3 / WAV / MP4 から選んでください。")
    return Preset(kind, quality)


def format_selector(selection: str) -> str:
    """yt-dlp のフォーマット指定文字列。左から順に試し、無ければ次善に落ちる。

    MP4 は「H.264(avc1)+AAC(mp4a)」を最優先にし、無ければコーデックを問わず
    希望画質以下、それも無ければ取れる範囲で最良のものを取る。
    """
    if selection == "audio":
        return "bestaudio[acodec!=none]/bestaudio/best"
    quality = selection.split(":", 1)[1]
    h = "" if quality == "best" else f"[height<={quality}]"
    chain = [
        f"bv*[vcodec^=avc1]{h}+ba[acodec^=mp4a]",
        f"bv*[vcodec^=avc1]{h}+ba",
        f"b[vcodec^=avc1]{h}",
        f"bv*{h}+ba",
        f"b{h}",
    ]
    if h:
        chain += ["bv*+ba", "b"]
    return "/".join(chain)


def is_h264(vcodec: str | None) -> bool | None:
    """True=H.264 / False=別コーデック / None=不明。"""
    v = (vcodec or "").lower()
    if not v or v in ("none", "unknown"):
        return None
    return v.startswith(("avc", "h264"))


def is_aac(acodec: str | None) -> bool | None:
    a = (acodec or "").lower()
    if not a or a in ("none", "unknown"):
        return None
    return a.startswith(("mp4a", "aac"))


def describe_formats(formats: list[dict]) -> str:
    """一覧に出す「どの形式で取れたか」。例: 1080p avc1 + mp4a 129kbps"""
    parts = []
    for f in formats:
        bits = []
        v, a = (f.get("vcodec") or "none"), (f.get("acodec") or "none")
        if v != "none":
            if f.get("height"):
                bits.append(f"{f['height']}p")
            bits.append(v.split(".")[0])
        if a != "none":
            bits.append(a.split(".")[0])
            if v == "none" and (f.get("abr") or f.get("tbr")):
                bits.append(f"{round(f.get('abr') or f.get('tbr'))}kbps")
        if not bits:
            bits.append(f.get("ext") or f.get("format_id") or "?")
        parts.append(" ".join(bits))
    return " + ".join(parts)

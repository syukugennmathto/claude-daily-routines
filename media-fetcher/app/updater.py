"""yt-dlp の更新・チャンネル切替・ロールバック。

バージョンごとに <data>/ytdlp/versions/<版>/ へ pip install --target で導入し、
state.json の current が指すディレクトリを子プロセスの PYTHONPATH に入れる。
current が "bundled" のときは、コンテナに同梱された版を使う。
"""
from __future__ import annotations

import asyncio
import json
import re
import shutil
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Awaitable, Callable

from .db import DB

BUNDLED = "bundled"
CHANNELS = ("stable", "nightly")


@dataclass
class Diagnosis:
    ok: bool
    summary: str = ""


class UpdateError(Exception):
    pass


async def pip_installer(target: Path, channel: str) -> str:
    """target に yt-dlp 一式を導入し、導入された版を返す。"""
    cmd = [sys.executable, "-m", "pip", "install", "--quiet", "--disable-pip-version-check", "--no-input",
           "--upgrade", "--target", str(target)]
    if channel == "nightly":
        cmd.append("--pre")
    cmd += ["yt-dlp[default]", "yt-dlp-ejs"]
    proc = await asyncio.create_subprocess_exec(*cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT)
    try:
        out, _ = await asyncio.wait_for(proc.communicate(), 600)
    except asyncio.TimeoutError:
        proc.kill()
        raise UpdateError("pip install がタイムアウトしました。") from None
    if proc.returncode != 0:
        raise UpdateError("pip install に失敗しました：" + out.decode("utf-8", "replace")[-600:])
    return read_version(target)


def read_version(target: Path) -> str:
    try:
        text = (target / "yt_dlp" / "version.py").read_text("utf-8")
        return re.search(r"__version__\s*=\s*['\"]([^'\"]+)['\"]", text).group(1)
    except (OSError, AttributeError):
        raise UpdateError("導入した yt-dlp のバージョンを読み取れません。") from None


class Updater:
    def __init__(self, base_dir: Path, db: DB, *, default_channel: str = "stable",
                 installer: Callable[[Path, str], Awaitable[str]] = pip_installer,
                 diagnose: Callable[[], Awaitable[Diagnosis]] | None = None):
        self.base = Path(base_dir)
        self.versions = self.base / "versions"
        self.versions.mkdir(parents=True, exist_ok=True)
        self.state_file = self.base / "state.json"
        self.db = db
        self.installer = installer
        self.diagnose = diagnose
        self.lock = asyncio.Lock()
        self.default_channel = default_channel if default_channel in CHANNELS else "stable"
        self.state = self._load()

    # ---- 状態 ----
    def _load(self) -> dict:
        state = {"channel": self.default_channel, "current": BUNDLED, "previous": None, "bad": [], "last_check": None}
        try:
            state.update(json.loads(self.state_file.read_text("utf-8")))
        except (OSError, ValueError):
            pass
        if state["current"] != BUNDLED and not (self.versions / state["current"]).is_dir():
            state["current"] = BUNDLED
        if state["previous"] not in (None, BUNDLED) and not (self.versions / state["previous"]).is_dir():
            state["previous"] = None
        return state

    def _save(self) -> None:
        tmp = self.state_file.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.state, ensure_ascii=False, indent=1), "utf-8")
        tmp.replace(self.state_file)

    def path_for(self, version: str | None) -> str | None:
        if not version or version == BUNDLED:
            return None
        return str(self.versions / version)

    def current_path(self) -> str | None:
        return self.path_for(self.state["current"])

    def _record(self, action: str, frm, to, ok: bool, message: str) -> dict:
        self.db.add_update(action=action, channel=self.state["channel"], from_version=frm, to_version=to,
                           ok=int(ok), message=message)
        return {"action": action, "ok": ok, "from": frm, "to": to, "message": message}

    def _prune(self) -> None:
        keep = {self.state["current"], self.state["previous"]}
        for d in self.versions.iterdir():
            if d.is_dir() and d.name not in keep:
                shutil.rmtree(d, ignore_errors=True)

    # ---- 操作 ----
    async def update(self, channel: str | None = None, *, manual: bool = False) -> dict:
        """最新版へ更新する。更新後の自己診断が失敗し、旧版なら成功する場合は自動で戻す。"""
        async with self.lock:
            if channel:
                if channel not in CHANNELS:
                    raise UpdateError("チャンネルは stable / nightly のどちらかです。")
                self.state["channel"] = channel
            channel = self.state["channel"]
            old = self.state["current"]
            self.state["last_check"] = time.time()
            self._save()
            tmp = self.versions / f".tmp-{int(time.time() * 1000)}"
            try:
                version = await self.installer(tmp, channel)
            except UpdateError as e:
                shutil.rmtree(tmp, ignore_errors=True)
                return self._record("update", old, None, False, str(e))
            except Exception as e:
                shutil.rmtree(tmp, ignore_errors=True)
                return self._record("update", old, None, False, f"更新に失敗しました：{type(e).__name__}: {e}")
            if version == old:
                shutil.rmtree(tmp, ignore_errors=True)
                return self._record("check", old, version, True, f"すでに最新です（{channel} {version}）。")
            if version in self.state["bad"] and not manual:
                shutil.rmtree(tmp, ignore_errors=True)
                return self._record("check", old, version, True,
                                    f"{version} は以前の自己診断で失敗したため、自動更新を見送りました。")
            dest = self.versions / version
            shutil.rmtree(dest, ignore_errors=True)
            tmp.rename(dest)
            self.state.update(current=version, previous=old)
            self._save()

            if self.diagnose is None:
                self._prune()
                return self._record("update", old, version, True, f"{version} に更新しました。")
            new_diag = await self.diagnose()
            if new_diag.ok:
                self.state["bad"] = [b for b in self.state["bad"] if b != version]
                self._save()
                self._prune()
                return self._record("update", old, version, True, f"{version} に更新し、自己診断に合格しました。")
            # 新版で失敗 → 旧版に戻して確認する
            self.state.update(current=old, previous=version)
            self._save()
            old_diag = await self.diagnose()
            if old_diag.ok:
                self.state["bad"] = sorted({*self.state["bad"], version})[-10:]
                self._save()
                return self._record(
                    "auto_rollback", version, old, False,
                    f"{version} は自己診断に失敗したため、{old} に自動で戻しました。（{new_diag.summary}）")
            # 旧版でも失敗 → 更新が原因ではない（回線断・Cookie切れ・サイト側障害など）。新版を維持する
            self.state.update(current=version, previous=old)
            self._save()
            self._prune()
            return self._record(
                "update", old, version, True,
                f"{version} に更新しました。自己診断は新旧どちらの版でも失敗しており、更新が原因ではないと判断しました。"
                f"（{new_diag.summary}）")

    async def rollback(self) -> dict:
        async with self.lock:
            cur, prev = self.state["current"], self.state["previous"]
            if not prev:
                return self._record("rollback", cur, None, False, "戻せる前のバージョンがありません。")
            self.state.update(current=prev, previous=cur)
            self._save()
            return self._record("rollback", cur, prev, True, f"{cur} から {prev} に戻しました。")

    async def set_channel(self, channel: str) -> dict:
        if channel not in CHANNELS:
            raise UpdateError("チャンネルは stable / nightly のどちらかです。")
        return await self.update(channel, manual=True)

    def info(self) -> dict:
        return {"channel": self.state["channel"], "current": self.state["current"], "previous": self.state["previous"],
                "bad": self.state["bad"], "last_check": self.state["last_check"],
                "history": self.db.recent_updates(8)}

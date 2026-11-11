"""自己診断（ヘルスチェック）。"""
from __future__ import annotations

import time

from . import error_rules
from .config import Settings
from .db import DB
from .downloader.adapters import adapter
from .downloader.base import Downloader
from .login import STATUS_UNSET, LoginManager, run_with_login_policy
from .updater import Diagnosis

# 分類ごとの「原因候補」。自己診断に失敗したとき管理画面に出す
CAUSES = {
    error_rules.SITE_CHANGE: "サイトの仕様変更に yt-dlp が追従できていない可能性があります。「更新」を試してください。"
                             "更新直後に壊れた場合は「ロールバック」を試してください。",
    error_rules.BOT_BLOCK: "ボット判定・一時ブロックの可能性があります。数時間おいて再実行してください。"
                           "自宅回線以外（VPS・クラウド・VPN出口）で動かしていないか確認してください。",
    error_rules.NETWORK: "サーバーがインターネットに接続できていない可能性があります。回線・DNSを確認してください。",
    error_rules.COOKIE_EXPIRED: "Cookie（ログイン状態）が期限切れです。管理画面から cookies.txt を再設定してください。",
    error_rules.LOGIN_REQUIRED: "診断用の動画がログイン必須になっています。.env の診断用URLを、誰でも見られる公開動画に変えてください。",
    error_rules.PRIVATE_DELETED: "診断用の動画が削除・非公開になっています。.env の診断用URLを別の公開動画に変えてください。",
    error_rules.GEO: "診断用の動画が地域制限されています。.env の診断用URLを別の公開動画に変えてください。",
    error_rules.LIVE: "診断用のURLがライブ配信です。通常の公開動画に変えてください。",
    error_rules.PAID_DRM: "診断用の動画が有料・限定です。.env の診断用URLを別の公開動画に変えてください。",
    error_rules.DISK_FULL: "サーバーの空き容量が不足しています。",
    error_rules.UNKNOWN: "原因を特定できません。詳細のメッセージを確認し、「更新」を試してください。",
}
DENO_CAUSE = ("Deno（JavaScript実行環境）が認識されていません。YouTube の取得に失敗します。"
              "コンテナを作り直す（docker compose build --no-cache）か、`docker compose exec app deno --version` で確認してください。")


class HealthChecker:
    def __init__(self, settings: Settings, db: DB, downloader: Downloader, lm: LoginManager):
        self.s, self.db, self.dl, self.lm = settings, db, downloader, lm
        self.last_env: dict = {}

    def targets(self) -> dict[str, str]:
        return {k: v for k, v in (("youtube", self.s.health_url_youtube), ("niconico", self.s.health_url_niconico)) if v}

    async def check_environment(self) -> dict:
        env = await self.dl.environment()
        problems = []
        if not env.get("ytdlp_version"):
            problems.append("yt-dlp を読み込めません。" + (env.get("error") or ""))
        if not env.get("deno"):
            problems.append(DENO_CAUSE)
        elif not env.get("deno_supported"):
            problems.append(f"Deno {env['deno']} は古すぎて yt-dlp が対応していません。コンテナを作り直してください。")
        if not env.get("ejs"):
            problems.append("yt-dlp-ejs（YouTubeのJSチャレンジ解決用スクリプト）が見つかりません。「更新」を実行してください。")
        if env.get("ffmpeg") is False:
            problems.append("ffmpeg が見つかりません。")
        env["problems"] = problems
        env["checked_at"] = time.time()
        self.last_env = env
        return env

    async def check_site(self, site: str, url: str, version: str | None) -> dict:
        t0 = time.time()
        used_login = None
        try:
            res, outcome = await run_with_login_policy(self.lm, site, lambda auth: self._test(url, auth))
            used_login = outcome.used_login
            row = dict(ok=1, meta_ok=1, download_ok=1, category=None, reason=None, hint=None,
                       detail=f"「{res.title}」のメタデータ取得と短い区間のダウンロードに成功しました。")
        except Exception as e:
            from .downloader.base import DownloadFailed
            if not isinstance(e, DownloadFailed):
                e = DownloadFailed(f"{type(e).__name__}: {e}", type(e).__name__)
            used_login = getattr(e, "used_login", None)
            c = (error_rules.from_category(e.category, e.message) if e.category
                 else error_rules.classify(e.message, e.exc_type, used_login=bool(used_login)))
            row = dict(ok=0, meta_ok=int(getattr(e, "meta_ok", False)), download_ok=0, category=c.category,
                       reason=c.reason, hint=CAUSES.get(c.category, c.hint), detail=e.message[:3000])
        row.update(site=site, login_status=self.lm.status(site)["status"],
                   used_login=None if used_login is None else int(used_login),
                   ytdlp_version=version, seconds=round(time.time() - t0, 1))
        self.db.add_health(**row)
        return row

    async def _test(self, url, auth):
        r = await self.dl.self_test(url, auth=auth)
        if r.error is not None:
            r.error.meta_ok = r.meta_ok
            raise r.error
        return r

    async def run(self) -> dict:
        env = await self.check_environment()
        version = env.get("ytdlp_version")
        sites = [await self.check_site(site, url, version) for site, url in self.targets().items()]
        ok = not env["problems"] and all(s["ok"] for s in sites)
        self.db.set_setting("health_last_run", time.time())
        return {"ok": ok, "environment": env, "sites": sites}

    async def diagnose(self) -> Diagnosis:
        """更新後の合否判定用。ログイン切れなど、更新と無関係な失敗は不合格にしない。"""
        r = await self.run()
        fails = [f"環境: {p[:60]}" for p in r["environment"]["problems"] if "yt-dlp" in p]
        unrelated = {error_rules.COOKIE_EXPIRED, error_rules.LOGIN_REQUIRED, error_rules.PRIVATE_DELETED,
                     error_rules.GEO, error_rules.LIVE, error_rules.PAID_DRM, error_rules.DISK_FULL}
        for s in r["sites"]:
            if not s["ok"] and s["category"] not in unrelated:
                fails.append(f"{adapter(s['site']).label}: {s['reason']}")
        return Diagnosis(ok=not fails, summary=" / ".join(fails))

    def report(self) -> dict:
        configured = self.targets()
        rows = {r["site"]: r for r in self.db.latest_health()}
        sites = []
        for site in ("youtube", "niconico"):
            ad = adapter(site)
            r = rows.get(site)
            st = self.lm.status(site)
            sites.append({"site": site, "label": ad.label, "configured": site in configured, "result": r,
                          "login_status": st["status"], "login_status_label": st["status_label"],
                          "login_unset": st["status"] == STATUS_UNSET})
        return {"environment": self.last_env, "sites": sites, "last_run": self.db.get_setting("health_last_run")}

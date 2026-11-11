"""ジョブキュー（asyncio ワーカー + SQLite）、プレビュー、見積もりの学習。"""
from __future__ import annotations

import asyncio
import errno
import logging
import random
import secrets as pysecrets
import shutil
import time
from pathlib import Path

from . import error_rules, estimator
from .config import Settings
from .db import DB
from .downloader.adapters import adapter, adapter_for_url
from .downloader.base import Cancelled, DownloadFailed, Downloader, DownloadRequest, Progress
from .ffmpeg import FFmpegError, learned_rate, plan_conversion, run_ffmpeg
from .formats import ALL_PRESETS, Preset, describe_formats, parse_preset
from .login import LoginManager, run_with_login_policy
from .security import UrlRejected, redact, sanitize_filename, validate_url

log = logging.getLogger("mediafetcher.jobs")

QUEUED, DOWNLOADING, CONVERTING, DONE, FAILED = "queued", "downloading", "converting", "done", "failed"
STATE_LABEL = {QUEUED: "待機", DOWNLOADING: "取得中", CONVERTING: "変換中", DONE: "完了", FAILED: "失敗"}
TRANSITIONS = {
    QUEUED: {DOWNLOADING, FAILED},
    DOWNLOADING: {CONVERTING, QUEUED, FAILED},     # QUEUED = 自動再試行待ち・再起動時の復元
    CONVERTING: {DONE, QUEUED, FAILED},
    DONE: set(),
    FAILED: {QUEUED},                              # 手動の再試行
}
DISK_MARGIN = 200 * 1024 * 1024
PREVIEW_TTL = 900


class InvalidTransition(Exception):
    pass


def can_transition(old: str, new: str) -> bool:
    return new in TRANSITIONS.get(old, set())


def backoff_delay(attempt: int, base: float) -> float:
    """指数バックオフ。attempt は「何回目の失敗か」（1始まり）。"""
    return base * (2 ** max(0, attempt - 1))


class JobManager:
    def __init__(self, settings: Settings, db: DB, lm: LoginManager, downloaders: dict[str, Downloader],
                 updater=None, sleep=asyncio.sleep):
        self.s, self.db, self.lm, self.downloaders, self.updater = settings, db, lm, downloaders, updater
        self._sleep = sleep
        self._cancels: dict[int, asyncio.Event] = {}
        self._tasks: list[asyncio.Task] = []
        self._wake = asyncio.Event()
        self._preview_lock = asyncio.Lock()
        self._previews: dict[str, dict] = {}
        self._last_write: dict[int, float] = {}
        self._stopping = False

    # ------------------------------------------------------------------ 設定・速度
    def concurrency(self) -> int:
        v = self.db.get_setting("concurrency", self.s.max_concurrency)
        return min(2, max(1, int(v or 1)))

    def set_concurrency(self, n: int) -> None:
        if n not in (1, 2):
            raise ValueError("同時実行数は 1 または 2 です。")
        self.db.set_setting("concurrency", n)
        self._wake.set()

    def rates(self, site: str) -> estimator.Rates:
        dl = self.db.recent_samples("dl_speed", site)
        xf = self.db.recent_samples("xfer_speed", "phone")
        oh = self.db.recent_samples("overhead", site)
        conv, learned = {}, {"download": bool(dl), "transfer": bool(xf)}
        for op, default in estimator.DEFAULT_CONV_RATE.items():
            vals = self.db.recent_samples("conv_rate", op)
            conv[op] = estimator.moving_average(vals, default)
            learned[op] = bool(vals)
        return estimator.Rates(
            download_bps=estimator.moving_average(dl, estimator.mbps_to_bps(self.s.default_download_mbps)),
            overhead_s=estimator.moving_average(oh, self.s.default_overhead_seconds),
            transfer_bps=estimator.moving_average(xf, estimator.mbps_to_bps(self.s.default_transfer_mbps)),
            conv_rate=conv, learned=learned)

    def rates_report(self) -> dict:
        out = {"sites": {}, "conversion": {}, "transfer": None}
        for site in ("youtube", "niconico", "generic"):
            r = self.rates(site)
            out["sites"][site] = {"label": adapter(site).label, "download_mbps": round(r.download_bps * 8 / 1e6, 1),
                                  "overhead_s": round(r.overhead_s, 1), "learned": r.learned["download"]}
        r = self.rates("generic")
        for op, v in r.conv_rate.items():
            out["conversion"][op] = {"rate": round(v, 1), "learned": r.learned[op]}
        out["transfer"] = {"mbps": round(r.transfer_bps * 8 / 1e6, 1), "learned": r.learned["transfer"]}
        return out

    def _gap_avg(self) -> float:
        return (self.s.job_gap_min + self.s.job_gap_max) / 2

    def _remaining_server(self, job: dict) -> float:
        if job["state"] in (DOWNLOADING, CONVERTING) and job.get("eta_remaining") is not None:
            return max(0.0, job["eta_remaining"])
        return (job.get("est_fetch") or 45.0) + (job.get("est_convert") or 15.0)

    def wait_before(self, job_id: int | None = None, active: list[dict] | None = None) -> float:
        active = self.db.active_jobs() if active is None else active
        before = [j for j in active if job_id is None or j["id"] < job_id]
        return estimator.queue_wait([self._remaining_server(j) for j in before], self._gap_avg(), self.concurrency())

    # ------------------------------------------------------------------ エラー整形
    def _classify(self, e: Exception, used_login: bool) -> error_rules.Classified:
        if isinstance(e, DownloadFailed):
            if e.category:
                c = error_rules.from_category(e.category, e.message, **e.extra)
            else:
                c = error_rules.classify(e.message, e.exc_type, used_login=used_login)
                c.extra.update(e.extra)
        elif isinstance(e, FFmpegError):
            detail = f"{e}\n--- ffmpeg ログ末尾 ---\n{e.log_tail}"
            cat = error_rules.DISK_FULL if "No space left" in e.log_tail else error_rules.CONVERT_FAILED
            c = error_rules.from_category(cat, detail)
        elif isinstance(e, OSError) and e.errno in (errno.ENOSPC, errno.EDQUOT):
            c = error_rules.from_category(error_rules.DISK_FULL, str(e))
        else:
            c = error_rules.classify(f"{type(e).__name__}: {e}", type(e).__name__, used_login=used_login)
        c.detail = redact(c.detail, self.s.secrets(), [str(self.s.cookies_dir)])[:6000]
        return c

    def _error_public(self, c: error_rules.Classified, site: str) -> dict:
        d = c.to_dict()
        d["login_available"] = self.lm.auth(site) is not None and self.lm.mode(site) != "never"
        if c.category == error_rules.DISK_FULL and "free_bytes" in d:
            d["reason"] = (f"サーバーの空き容量が足りません（空き {estimator.format_size_ja(d['free_bytes'])}・"
                           f"必要 {estimator.format_size_ja(d['needed_bytes'])}）。")
        return d

    # ------------------------------------------------------------------ プレビュー
    def _options(self, selections: dict, duration, site: str, wait: float) -> list[dict]:
        rates = self.rates(site)
        out = []
        for p in ALL_PRESETS:
            formats = selections.get(p.selection) or []
            est = estimator.estimate(p, formats, duration, rates, wait)
            note = describe_formats(formats) if formats else ""
            out.append({
                "key": p.key, "kind": p.kind, "quality": p.quality, "label": p.label,
                "size_text": ("約" if est.size_basis != "filesize" else "") + estimator.format_size_ja(est.output_bytes),
                "time_text": estimator.format_ja(est), "format_note": note, "reencode": est.reencode,
                "low_confidence": est.size_basis == "assumed",
                "note": ("H.264 で取得できないため再エンコードします（変換に時間がかかります）" if est.reencode else
                         "動画の長さが不明なため、時間は見積もれません" if not duration else
                         "サイズ情報が無いため、おおまかな推定です" if est.size_basis == "assumed" else ""),
                "estimate": est.to_dict(),
            })
        return out

    async def preview(self, url: str, playlist_all: bool = False) -> dict:
        try:
            url = await asyncio.to_thread(validate_url, url, resolve=True)
        except UrlRejected as e:
            return {"ok": False, "error": {"category": "invalid_url", "reason": str(e), "action": "none",
                                           "hint": "", "detail": ""}}
        ad = adapter_for_url(url)
        dl = self.downloaders[ad.downloader]
        async with self._preview_lock:
            try:
                res, outcome = await run_with_login_policy(
                    self.lm, ad.key, lambda auth: dl.probe(url, auth=auth, playlist=playlist_all,
                                                           playlist_limit=self.s.playlist_limit))
            except DownloadFailed as e:
                c = self._classify(e, bool(getattr(e, "used_login", False)))
                return {"ok": False, "site": ad.key, "error": self._error_public(c, ad.key)}
        wait = self.wait_before()
        token = pysecrets.token_urlsafe(12)
        now = time.time()
        self._previews = {k: v for k, v in self._previews.items() if now - v["ts"] < PREVIEW_TTL}
        self._previews[token] = {"ts": now, "url": url, "site": ad.key, "res": res, "playlist_all": playlist_all}
        base = {"ok": True, "token": token, "site": ad.key, "site_label": ad.label, "url": url,
                "used_login": outcome.used_login, "wait_s": wait}
        if res.playlist:
            items = res.playlist[: self.s.playlist_limit]
            rates = self.rates(ad.key)
            options = []
            for p in ALL_PRESETS:
                ests = [estimator.estimate(p, [], it.get("duration"), rates) for it in items]
                total = estimator.Estimate(
                    sum(e.source_bytes for e in ests), sum(e.output_bytes for e in ests), "assumed", False,
                    sum(e.fetch_s for e in ests) + self._gap_avg() * max(0, len(items) - 1),
                    sum(e.convert_s for e in ests), sum(e.transfer_s for e in ests), wait)
                total.low_s, total.high_s = total.total_s * 0.4, total.total_s * 2.5
                options.append({"key": p.key, "kind": p.kind, "quality": p.quality, "label": p.label,
                                "size_text": "約" + estimator.format_size_ja(total.output_bytes),
                                "time_text": estimator.format_ja(total), "format_note": "", "reencode": False,
                                "low_confidence": True, "note": "全件の合計（おおまかな推定）",
                                "estimate": total.to_dict()})
            return {**base, "playlist": True, "title": res.playlist_title or res.title, "count": len(items),
                    "limit": self.s.playlist_limit, "thumbnail": None, "duration": None,
                    "items": [{"title": i["title"], "duration": i.get("duration")} for i in items], "options": options}
        return {**base, "playlist": False, "title": res.title, "thumbnail": res.thumbnail, "duration": res.duration,
                "options": self._options(res.selections, res.duration, ad.key, wait)}

    # ------------------------------------------------------------------ ジョブ作成
    def _est_fields(self, preset: Preset, formats: list[dict], duration, site: str, wait: float) -> dict:
        est = estimator.estimate(preset, formats, duration, self.rates(site), wait)
        return dict(est_wait=est.wait_s, est_fetch=est.fetch_s, est_convert=est.convert_s, est_transfer=est.transfer_s,
                    est_low=est.low_s, est_high=est.high_s, est_source_bytes=est.source_bytes,
                    est_output_bytes=est.output_bytes, est_basis=est.size_basis, reencode=int(est.reencode))

    async def create_jobs(self, url: str, kind: str, quality: str | None, *, token: str | None = None,
                          playlist_all: bool = False, force_login: bool = False) -> list[int]:
        preset = parse_preset(kind, quality)
        url = await asyncio.to_thread(validate_url, url, resolve=token is None)
        ad = adapter_for_url(url)
        cached = self._previews.get(token or "")
        if cached and (cached["url"] != url or time.time() - cached["ts"] > PREVIEW_TTL):
            cached = None
        res = cached["res"] if cached else None
        ids: list[int] = []
        common = dict(kind=preset.kind, quality=preset.quality, force_login=int(force_login))
        if playlist_all:
            if not (res and res.playlist):
                dl = self.downloaders[ad.downloader]
                res, _ = await run_with_login_policy(
                    self.lm, ad.key, lambda auth: dl.probe(url, auth=auth, playlist=True,
                                                           playlist_limit=self.s.playlist_limit))
            for item in (res.playlist or [])[: self.s.playlist_limit]:
                try:
                    item_url = validate_url(item["url"])
                except UrlRejected:
                    continue
                site = adapter_for_url(item_url).key
                wait = self.wait_before()
                ids.append(self.db.add_job(url=item_url, site=site, title=item.get("title"),
                                           duration=item.get("duration"), **common,
                                           **self._est_fields(preset, [], item.get("duration"), site, wait)))
            if ids:
                self._wake.set()
                return ids
            # プレイリストではなかった場合は単体として扱う
        wait = self.wait_before()
        fields = dict(url=url, site=ad.key, **common)
        if res and not res.playlist:
            formats = res.selections.get(preset.selection) or []
            fields.update(title=res.title, thumbnail=res.thumbnail, duration=res.duration,
                          format_note=describe_formats(formats) if formats else None,
                          **self._est_fields(preset, formats, res.duration, ad.key, wait))
        ids.append(self.db.add_job(**fields))
        self._wake.set()
        return ids

    # ------------------------------------------------------------------ 状態遷移
    def _transition(self, job_id: int, new: str, **fields) -> bool:
        job = self.db.get_job(job_id)
        if job is None:
            return False
        if not can_transition(job["state"], new):
            raise InvalidTransition(f"{job['state']} → {new} は許可されていません")
        self.db.update_job(job_id, state=new, **fields)
        return True

    async def retry(self, job_id: int, *, use_login: bool = False, update_first: bool = False) -> dict:
        job = self.db.get_job(job_id)
        if job is None:
            raise KeyError(job_id)
        if job["state"] not in (FAILED, QUEUED):
            raise InvalidTransition("このジョブは再試行できません。")
        update_result = None
        if update_first and self.updater is not None:
            update_result = await self.updater.update(manual=True)
        fields = dict(attempts=0, next_attempt_at=None, progress=0, eta_remaining=None,
                      force_login=int(use_login or job["force_login"]),
                      error_category=None, error_reason=None, error_action=None, error_hint=None,
                      error_detail=None, error_extra=None, finished_at=None)
        if job["state"] == FAILED:
            self._transition(job_id, QUEUED, **fields)
        else:
            self.db.update_job(job_id, **fields)
        self._wake.set()
        return {"ok": True, "update": update_result}

    def delete(self, job_id: int) -> bool:
        job = self.db.get_job(job_id)
        if job is None:
            return False
        ev = self._cancels.get(job_id)
        if ev:
            ev.set()
        self.db.delete_job(job_id)
        self._remove_files(job_id)
        return True

    def _remove_files(self, job_id: int) -> None:
        shutil.rmtree(self.s.downloads_dir / str(int(job_id)), ignore_errors=True)
        shutil.rmtree(self.s.work_dir / f"job-{int(job_id)}", ignore_errors=True)

    # ------------------------------------------------------------------ ワーカー
    def recover(self) -> int:
        n = self.db.recover_interrupted()
        for d in self.s.work_dir.glob("*"):
            shutil.rmtree(d, ignore_errors=True) if d.is_dir() else d.unlink(missing_ok=True)
        return n

    def start(self) -> None:
        self._stopping = False
        self._tasks = [asyncio.create_task(self._worker(i)) for i in range(2)]

    async def stop(self) -> None:
        self._stopping = True
        for ev in self._cancels.values():
            ev.set()
        for t in self._tasks:
            t.cancel()
        await asyncio.gather(*self._tasks, return_exceptions=True)
        self._tasks = []

    async def _worker(self, index: int) -> None:
        while not self._stopping:
            try:
                job = self.db.claim_next_job() if index < self.concurrency() else None
                if job is None:
                    self._wake.clear()
                    try:
                        await asyncio.wait_for(self._wake.wait(), timeout=5)
                    except asyncio.TimeoutError:
                        pass
                    continue
                await self.run_job(job)
                # 人間が使う程度の頻度に抑えるため、ジョブ間にランダムな待機を入れる
                await self._sleep(random.uniform(self.s.job_gap_min, self.s.job_gap_max))
            except asyncio.CancelledError:
                raise
            except Exception:
                log.exception("worker error")
                await asyncio.sleep(2)

    def _check_disk(self, job: dict) -> None:
        needed = (job.get("est_source_bytes") or 0) + (job.get("est_output_bytes") or 0) + DISK_MARGIN
        free = shutil.disk_usage(self.s.downloads_dir).free
        if free < needed:
            raise DownloadFailed("not enough free space on server", "DiskFull", category=error_rules.DISK_FULL,
                                 extra={"free_bytes": free, "needed_bytes": needed})

    async def run_job(self, job: dict) -> None:
        job_id, site = job["id"], job["site"]
        preset = Preset(job["kind"], job["quality"])
        dl = self.downloaders[adapter(site).downloader]
        workdir = self.s.work_dir / f"job-{job_id}"
        shutil.rmtree(workdir, ignore_errors=True)
        workdir.mkdir(parents=True)
        cancel = asyncio.Event()
        self._cancels[job_id] = cancel
        st = {"est_fetch": job.get("est_fetch"), "est_convert": job.get("est_convert") or 0.0,
              "est_source": job.get("est_source_bytes"), "duration": job.get("duration"), "used_login": False}

        def write(force=False, **fields):
            now = time.time()
            if not force and now - self._last_write.get(job_id, 0) < 1.0:
                return
            self._last_write[job_id] = now
            self.db.update_job(job_id, **fields)

        def weight() -> float:
            f, c = st["est_fetch"] or 30.0, st["est_convert"] or 0.0
            return f / (f + c) if f + c > 0 else 1.0

        def on_progress(p: Progress):
            if p.meta:
                m = p.meta
                st["duration"] = m.get("duration") or st["duration"]
                fields = dict(title=m.get("title") or job.get("title"), duration=st["duration"],
                              thumbnail=m.get("thumbnail") or job.get("thumbnail"),
                              format_note=describe_formats(m.get("formats") or []),
                              reencode=int(estimator.needs_reencode(m.get("formats") or [])))
                if job.get("est_fetch") is None:
                    # プレビューを経ずに追加されたジョブは、ここで初めて見積もる
                    est = self._est_fields(preset, m.get("formats") or [], st["duration"], site, 0.0)
                    est["est_wait"] = max(0.0, (job.get("started_at") or time.time()) - job["created_at"])
                    fields.update(est)
                    st.update(est_fetch=est["est_fetch"], est_convert=est["est_convert"], est_source=est["est_source_bytes"])
                else:
                    conv, _ = estimator.convert_seconds(preset, m.get("formats") or [], st["duration"], self.rates(site))
                    st["est_convert"] = conv
                write(force=True, **fields)
                return
            total = p.total or st["est_source"]
            frac = min(1.0, p.downloaded / total) if total else 0.0
            if total and p.speed:
                eta = max(0.0, (total - p.downloaded) / p.speed)
            elif p.eta is not None:
                eta = float(p.eta)
            else:
                eta = (st["est_fetch"] or 30.0) * (1 - frac)
            write(progress=round(100 * weight() * frac, 1), eta_remaining=eta + st["est_convert"])

        try:
            self._check_disk(job)

            async def fetch(auth):
                st["used_login"] = auth is not None
                self.db.update_job(job_id, used_login=int(auth is not None))
                return await dl.download(DownloadRequest(job["url"], preset.selection, workdir, auth),
                                         on_progress, cancel)

            res, outcome = await run_with_login_policy(self.lm, site, fetch, force_login=bool(job["force_login"]))
            title = res.title or job.get("title") or "download"
            duration = res.duration or st["duration"]
            if not self._transition(job_id, CONVERTING, used_login=int(outcome.used_login), title=title,
                                    duration=duration, progress=round(100 * weight(), 1),
                                    eta_remaining=st["est_convert"], act_overhead=res.overhead_s,
                                    act_fetch=res.overhead_s + res.download_s, act_source_bytes=res.bytes,
                                    act_download_bps=(res.bytes / res.download_s if res.download_s > 0 else None)):
                return

            out_dir = self.s.downloads_dir / str(job_id)
            shutil.rmtree(out_dir, ignore_errors=True)
            out_dir.mkdir(parents=True)
            file_name = sanitize_filename(title, preset.ext)
            out_path = out_dir / file_name
            plan = await plan_conversion(preset, res.files, out_path, title)
            if not duration:
                duration = await self._probe_duration(res.files[0]["path"])
            t_conv0 = time.time()

            def on_conv(frac: float):
                w = weight()
                elapsed = time.time() - t_conv0
                remain = elapsed * (1 - frac) / frac if frac > 0.02 else st["est_convert"] * (1 - frac)
                write(progress=round(100 * (w + (1 - w) * frac), 1), eta_remaining=remain)

            conv_s = await run_ffmpeg(plan["args"], duration, on_conv, cancel)
            size = out_path.stat().st_size
            now = time.time()
            note = describe_formats(res.files)
            if plan["reencode"]:
                note += f" → H.264 に再エンコード（元: {plan.get('vcodec')}）"
            ok = self._transition(
                job_id, DONE, progress=100, eta_remaining=0, finished_at=now, duration=duration,
                expires_at=now + self.s.retention_days * 86400, file_name=file_name, file_path=str(out_path),
                file_size=size, act_convert=conv_s, act_output_bytes=size, format_note=note,
                reencode=int(plan["reencode"]), error_category=None, error_reason=None, error_action=None,
                error_hint=None, error_detail=None, error_extra=None, next_attempt_at=None)
            if not ok:
                shutil.rmtree(out_dir, ignore_errors=True)
                return
            self._learn(site, res, plan, duration, conv_s)
        except Cancelled:
            self._remove_files(job_id)
        except asyncio.CancelledError:
            raise
        except Exception as e:
            if not isinstance(e, (DownloadFailed, FFmpegError, OSError)):
                log.exception("job %s failed unexpectedly", job_id)
            self._handle_failure(job_id, e, bool(getattr(e, "used_login", st["used_login"])))
            shutil.rmtree(self.s.downloads_dir / str(job_id), ignore_errors=True)
        finally:
            self._cancels.pop(job_id, None)
            self._last_write.pop(job_id, None)
            shutil.rmtree(workdir, ignore_errors=True)

    async def _probe_duration(self, path: str) -> float | None:
        try:
            from .ffmpeg import ffprobe
            return float((await ffprobe(path)).get("format", {}).get("duration"))
        except Exception:
            return None

    def _learn(self, site: str, res, plan: dict, duration, conv_s: float) -> None:
        """実測値を記録し、次回以降の見積もりを補正する。"""
        if res.bytes >= 1_000_000 and res.download_s >= 0.5:
            self.db.add_sample("dl_speed", site, res.bytes / res.download_s)
        if res.overhead_s > 0:
            self.db.add_sample("overhead", site, res.overhead_s)
        if plan["op"] == "mp4_merge" and plan.get("audio_reencode"):
            return
        rate = learned_rate(plan["op"], duration or 0, conv_s, plan.get("pixels") or 0)
        if rate:
            self.db.add_sample("conv_rate", plan["op"], rate)

    def _handle_failure(self, job_id: int, e: Exception, used_login: bool) -> None:
        job = self.db.get_job(job_id)
        if job is None:
            return
        c = self._classify(e, used_login)
        import json
        fields = dict(error_category=c.category, error_reason=c.reason, error_action=c.action, error_hint=c.hint,
                      error_detail=c.detail, error_extra=json.dumps(c.extra, ensure_ascii=False),
                      used_login=int(used_login), eta_remaining=None)
        if c.category == error_rules.COOKIE_EXPIRED:
            self.lm.mark_expired(job["site"], c.detail[:300])
        if c.retryable and job["attempts"] <= self.s.max_retries:
            base = self.s.bot_retry_base if c.category == error_rules.BOT_BLOCK else self.s.retry_base
            delay = backoff_delay(job["attempts"], base) * random.uniform(0.9, 1.2)
            self._transition(job_id, QUEUED, next_attempt_at=time.time() + delay, progress=0, **fields)
        else:
            self._transition(job_id, FAILED, finished_at=time.time(), next_attempt_at=None, **fields)

    # ------------------------------------------------------------------ 転送・掃除
    def record_transfer(self, job_id: int, sent: int, seconds: float, complete: bool) -> None:
        if sent >= 2_000_000 and seconds >= 0.3:
            self.db.add_sample("xfer_speed", "phone", sent / seconds)
        if complete:
            job = self.db.get_job(job_id)
            if job and job.get("file_size") and sent >= job["file_size"]:
                self.db.update_job(job_id, act_transfer=seconds, act_transfer_bps=sent / seconds if seconds > 0 else None)

    def cleanup(self) -> int:
        """保存期限を過ぎた完了ファイルと、古い失敗ジョブを削除する。"""
        n = 0
        for job in self.db.expired_jobs():
            self.delete(job["id"])
            n += 1
        cutoff = time.time() - self.s.retention_days * 86400
        for job in self.db.list_jobs(1000):
            if job["state"] == FAILED and (job.get("finished_at") or job["created_at"]) < cutoff:
                self.delete(job["id"])
                n += 1
        known = {str(j["id"]) for j in self.db.list_jobs(100000)}
        for d in self.s.downloads_dir.iterdir():
            if d.is_dir() and d.name not in known:
                shutil.rmtree(d, ignore_errors=True)
        return n

    # ------------------------------------------------------------------ 一覧
    def public_job(self, job: dict, active: list[dict] | None = None) -> dict:
        import json
        preset = Preset(job["kind"], job["quality"])
        d = {k: job[k] for k in ("id", "url", "site", "title", "thumbnail", "duration", "state", "progress", "attempts",
                                 "created_at", "started_at", "finished_at", "expires_at", "file_name", "file_size",
                                 "format_note", "next_attempt_at")}
        d["state_label"] = STATE_LABEL[job["state"]]
        d["site_label"] = adapter(job["site"]).label
        d["preset_label"] = preset.label
        d["reencode"] = bool(job["reencode"])
        d["used_login"] = None if job["used_login"] is None else bool(job["used_login"])
        d["login_label"] = {None: "", 1: "ログインあり", 0: "ログインなし"}[job["used_login"]]
        d["size_text"] = estimator.format_size_ja(job["file_size"]) if job["file_size"] else None
        fmt = estimator.format_duration_ja
        if job["est_fetch"] is not None:
            est = estimator.Estimate(job["est_source_bytes"] or 0, job["est_output_bytes"] or 0, job["est_basis"] or "",
                                     bool(job["reencode"]), job["est_fetch"], job["est_convert"] or 0,
                                     job["est_transfer"] or 0, job["est_wait"] or 0, job["est_low"] or 0, job["est_high"] or 0)
            d["estimate_text"] = estimator.format_ja(est)
        else:
            d["estimate_text"] = None
        d["timing"] = {k: job[k] for k in ("est_wait", "est_fetch", "est_convert", "est_transfer",
                                           "act_fetch", "act_convert", "act_transfer")}
        d["eta_text"] = None
        xfer = job["est_transfer"]
        if job["state"] == QUEUED:
            if job["next_attempt_at"] and job["next_attempt_at"] > time.time():
                d["state_label"] = "再試行待ち"
            else:
                remain = self.wait_before(job["id"], active) + self._remaining_server(job)
                d["eta_text"] = f"残り約{fmt(remain)}" + (f"＋スマホへ約{fmt(xfer)}" if xfer else "")
        elif job["state"] in (DOWNLOADING, CONVERTING) and job["eta_remaining"] is not None:
            d["eta_text"] = f"残り約{fmt(job['eta_remaining'])}" + (f"＋スマホへ約{fmt(xfer)}" if xfer else "")
        elif job["state"] == DONE:
            xfer = (job["file_size"] or 0) / max(self.rates(job["site"]).transfer_bps, 1)
            d["eta_text"] = f"スマホへ約{fmt(xfer)}"
            parts = []
            if job["act_fetch"] is not None:
                parts.append(f"取得{fmt(job['act_fetch'])}")
            if job["act_convert"] is not None:
                parts.append(f"変換{fmt(job['act_convert'])}")
            if job["act_transfer"] is not None:
                parts.append(f"スマホへ{fmt(job['act_transfer'])}")
            d["actual_text"] = "実測：" + "・".join(parts) if parts else None
            d["download_url"] = f"/api/jobs/{job['id']}/file"
        if job["error_category"]:
            c = error_rules.Classified(job["error_category"], job["error_reason"] or "", job["error_action"] or "none",
                                       job["error_hint"] or "", job["error_detail"] or "",
                                       extra=json.loads(job["error_extra"] or "{}"))
            d["error"] = self._error_public(c, job["site"])
            d["error"]["will_retry"] = job["state"] == QUEUED
        else:
            d["error"] = None
        return d

    def list_public(self) -> dict:
        active = self.db.active_jobs()
        return {"jobs": [self.public_job(j, active) for j in self.db.list_jobs()], "banners": self.lm.banners(),
                "now": time.time()}

"""SQLite による永続化。ジョブ・実測値・設定・自己診断・更新履歴。"""
from __future__ import annotations

import json
import sqlite3
import threading
import time
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    site TEXT NOT NULL,
    kind TEXT NOT NULL,
    quality TEXT NOT NULL DEFAULT '',
    title TEXT, thumbnail TEXT, duration REAL,
    state TEXT NOT NULL DEFAULT 'queued',
    progress REAL NOT NULL DEFAULT 0,
    eta_remaining REAL,
    attempts INTEGER NOT NULL DEFAULT 0,
    next_attempt_at REAL,
    force_login INTEGER NOT NULL DEFAULT 0,
    used_login INTEGER,
    format_note TEXT,
    reencode INTEGER NOT NULL DEFAULT 0,
    file_name TEXT, file_path TEXT, file_size INTEGER,
    created_at REAL NOT NULL, started_at REAL, finished_at REAL, expires_at REAL,
    -- 見積もり値
    est_wait REAL, est_fetch REAL, est_convert REAL, est_transfer REAL,
    est_low REAL, est_high REAL, est_source_bytes INTEGER, est_output_bytes INTEGER, est_basis TEXT,
    -- 実測値
    act_overhead REAL, act_fetch REAL, act_convert REAL, act_transfer REAL,
    act_source_bytes INTEGER, act_output_bytes INTEGER, act_download_bps REAL, act_transfer_bps REAL,
    -- エラー
    error_category TEXT, error_reason TEXT, error_action TEXT, error_hint TEXT, error_detail TEXT, error_extra TEXT
);
CREATE INDEX IF NOT EXISTS idx_jobs_state ON jobs(state, next_attempt_at);
CREATE TABLE IF NOT EXISTS samples (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kind TEXT NOT NULL, key TEXT NOT NULL, value REAL NOT NULL, created_at REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_samples ON samples(kind, key, id);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS health (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ran_at REAL NOT NULL, site TEXT NOT NULL, ok INTEGER NOT NULL,
    meta_ok INTEGER, download_ok INTEGER, login_status TEXT, used_login INTEGER,
    category TEXT, reason TEXT, hint TEXT, detail TEXT, ytdlp_version TEXT, seconds REAL
);
CREATE TABLE IF NOT EXISTS updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ran_at REAL NOT NULL, action TEXT NOT NULL, channel TEXT,
    from_version TEXT, to_version TEXT, ok INTEGER NOT NULL, message TEXT
);
"""

JOB_UPDATABLE = None  # 初期化時にスキーマから作る


class DB:
    def __init__(self, path: Path | str):
        self.path = str(path)
        self._lock = threading.RLock()
        self._conn = sqlite3.connect(self.path, check_same_thread=False, isolation_level=None)
        self._conn.row_factory = sqlite3.Row
        with self._lock:
            if self.path != ":memory:":
                self._conn.execute("PRAGMA journal_mode=WAL")
            self._conn.execute("PRAGMA synchronous=NORMAL")
            self._conn.executescript(SCHEMA)
        self._job_cols = {r["name"] for r in self._conn.execute("PRAGMA table_info(jobs)")}

    def close(self) -> None:
        with self._lock:
            self._conn.close()

    def _q(self, sql: str, args=()) -> list[dict]:
        with self._lock:
            return [dict(r) for r in self._conn.execute(sql, args).fetchall()]

    def _x(self, sql: str, args=()) -> int:
        with self._lock:
            cur = self._conn.execute(sql, args)
            return cur.lastrowid if sql.lstrip().upper().startswith("INSERT") else cur.rowcount

    # ---- jobs ----
    def add_job(self, **fields) -> int:
        fields.setdefault("created_at", time.time())
        bad = set(fields) - self._job_cols
        if bad:
            raise KeyError(f"unknown job columns: {bad}")
        cols = ", ".join(fields)
        return self._x(f"INSERT INTO jobs ({cols}) VALUES ({', '.join('?' * len(fields))})", tuple(fields.values()))

    def update_job(self, job_id: int, **fields) -> None:
        if not fields:
            return
        bad = set(fields) - self._job_cols
        if bad:
            raise KeyError(f"unknown job columns: {bad}")
        sets = ", ".join(f"{k}=?" for k in fields)
        self._x(f"UPDATE jobs SET {sets} WHERE id=?", (*fields.values(), job_id))

    def get_job(self, job_id: int) -> dict | None:
        rows = self._q("SELECT * FROM jobs WHERE id=?", (job_id,))
        return rows[0] if rows else None

    def list_jobs(self, limit: int = 200) -> list[dict]:
        return self._q("SELECT * FROM jobs ORDER BY id DESC LIMIT ?", (limit,))

    def delete_job(self, job_id: int) -> None:
        self._x("DELETE FROM jobs WHERE id=?", (job_id,))

    def claim_next_job(self, now: float | None = None) -> dict | None:
        """実行可能な待機ジョブを1件取り出し、取得中にする（原子的）。"""
        now = now or time.time()
        with self._lock:
            rows = self._q(
                "SELECT * FROM jobs WHERE state='queued' AND (next_attempt_at IS NULL OR next_attempt_at<=?) "
                "ORDER BY id LIMIT 1", (now,))
            if not rows:
                return None
            job = rows[0]
            self._x("UPDATE jobs SET state='downloading', started_at=?, attempts=attempts+1, progress=0, "
                    "next_attempt_at=NULL WHERE id=?", (now, job["id"]))
            return self.get_job(job["id"])

    def active_jobs(self) -> list[dict]:
        return self._q("SELECT * FROM jobs WHERE state IN ('queued','downloading','converting') ORDER BY id")

    def recover_interrupted(self) -> int:
        """再起動時：実行途中だったジョブを待機に戻す（試行回数は消費しない）。"""
        return self._x("UPDATE jobs SET state='queued', progress=0, eta_remaining=NULL, "
                       "attempts=MAX(attempts-1,0) WHERE state IN ('downloading','converting')")

    def expired_jobs(self, now: float | None = None) -> list[dict]:
        return self._q("SELECT * FROM jobs WHERE state='done' AND expires_at IS NOT NULL AND expires_at<=?",
                       (now or time.time(),))

    # ---- samples ----
    def add_sample(self, kind: str, key: str, value: float) -> None:
        if value is None or value <= 0:
            return
        self._x("INSERT INTO samples (kind,key,value,created_at) VALUES (?,?,?,?)", (kind, key, float(value), time.time()))
        self._x("DELETE FROM samples WHERE kind=? AND key=? AND id NOT IN "
                "(SELECT id FROM samples WHERE kind=? AND key=? ORDER BY id DESC LIMIT 50)", (kind, key, kind, key))

    def recent_samples(self, kind: str, key: str, n: int = 5) -> list[float]:
        return [r["value"] for r in self._q(
            "SELECT value FROM samples WHERE kind=? AND key=? ORDER BY id DESC LIMIT ?", (kind, key, n))]

    def clear_samples(self, kind: str | None = None) -> None:
        if kind:
            self._x("DELETE FROM samples WHERE kind=?", (kind,))
        else:
            self._x("DELETE FROM samples")

    def has_samples(self, kind: str) -> bool:
        return bool(self._q("SELECT 1 FROM samples WHERE kind=? LIMIT 1", (kind,)))

    # ---- settings ----
    def get_setting(self, key: str, default=None):
        rows = self._q("SELECT value FROM settings WHERE key=?", (key,))
        return json.loads(rows[0]["value"]) if rows else default

    def set_setting(self, key: str, value) -> None:
        self._x("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                (key, json.dumps(value, ensure_ascii=False)))

    # ---- health / updates ----
    def add_health(self, **f) -> None:
        f.setdefault("ran_at", time.time())
        self._x(f"INSERT INTO health ({', '.join(f)}) VALUES ({', '.join('?' * len(f))})", tuple(f.values()))
        self._x("DELETE FROM health WHERE id NOT IN (SELECT id FROM health ORDER BY id DESC LIMIT 200)")

    def latest_health(self) -> list[dict]:
        return self._q("SELECT * FROM health WHERE id IN (SELECT MAX(id) FROM health GROUP BY site) ORDER BY site")

    def add_update(self, **f) -> None:
        f.setdefault("ran_at", time.time())
        self._x(f"INSERT INTO updates ({', '.join(f)}) VALUES ({', '.join('?' * len(f))})", tuple(f.values()))
        self._x("DELETE FROM updates WHERE id NOT IN (SELECT id FROM updates ORDER BY id DESC LIMIT 100)")

    def recent_updates(self, n: int = 10) -> list[dict]:
        return self._q("SELECT * FROM updates ORDER BY id DESC LIMIT ?", (n,))

    def accuracy(self, n: int = 20) -> dict:
        """直近 n 件の完了ジョブの、見積もりと実測の平均誤差。"""
        rows = self._q(
            "SELECT est_fetch, est_convert, est_transfer, act_overhead, act_fetch, act_convert, act_transfer "
            "FROM jobs WHERE state='done' AND act_fetch IS NOT NULL AND est_fetch IS NOT NULL "
            "AND COALESCE(est_basis,'') != 'assumed' ORDER BY id DESC LIMIT ?", (n,))

        def stat(pairs):
            errs = [(e - a) / a for e, a in pairs if e is not None and a and a > 0.5]
            if not errs:
                return None
            return {"count": len(errs), "mean_abs_pct": round(sum(abs(x) for x in errs) / len(errs) * 100, 1),
                    "bias_pct": round(sum(errs) / len(errs) * 100, 1)}

        return {
            "fetch": stat([(r["est_fetch"], r["act_fetch"]) for r in rows]),
            "convert": stat([(r["est_convert"], r["act_convert"]) for r in rows]),
            "transfer": stat([(r["est_transfer"], r["act_transfer"]) for r in rows]),
            "server_total": stat([((r["est_fetch"] or 0) + (r["est_convert"] or 0),
                                   (r["act_fetch"] or 0) + (r["act_convert"] or 0)) for r in rows]),
        }

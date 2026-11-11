#!/usr/bin/env python3
"""実地試験：動いているサーバーに対して、実際のURLで MP3 / WAV / MP4 を取得し、
見積もり時間と実測時間を並べて表示する。標準ライブラリだけで動く。

使い方（サーバーを起動した自宅マシンで）:
    python3 scripts/field_test.py --token "$APP_TOKEN" \\
        "https://www.youtube.com/watch?v=..." "https://www.nicovideo.jp/watch/sm..."

  --login both        ログインなし／ありの両方で試す（既定）。none / with も指定可
  --expect 分類=URL   そのURLが指定の分類で失敗することを確認する（複数指定可）
                      例: --expect private_deleted=https://www.youtube.com/watch?v=xxxx
                      分類: private_deleted geo_restricted login_required cookie_expired paid_drm
                            live bot_block site_change
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request

PRESETS = [("mp3", "192"), ("wav", ""), ("mp4", "720")]


class Client:
    def __init__(self, base: str, token: str):
        self.base, self.token = base.rstrip("/"), token

    def call(self, method: str, path: str, body=None, raw: bool = False):
        req = urllib.request.Request(self.base + path, method=method,
                                     headers={"Authorization": f"Bearer {self.token}", "X-App": "1"})
        if body is not None:
            req.data = json.dumps(body).encode()
            req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=600) as res:
            if raw:
                n, t0 = 0, time.time()
                while chunk := res.read(1 << 18):
                    n += len(chunk)
                return n, time.time() - t0
            return json.loads(res.read() or b"{}")


def secs(v) -> str:
    return "-" if v is None else f"{v:.1f}"


def run_one(c: Client, url: str, kind: str, quality: str, label: str) -> dict:
    pre = c.call("POST", "/api/preview", {"url": url})
    if not pre.get("ok"):
        e = pre["error"]
        return {"label": label, "error": f"{e['category']}: {e['reason']}"}
    key = f"{kind}:{quality}" if quality else kind
    opt = next(o for o in pre["options"] if o["key"] == key)
    est = opt["estimate"]
    jid = c.call("POST", "/api/jobs", {"url": url, "token": pre["token"], "kind": kind, "quality": quality})["ids"][0]
    while True:
        time.sleep(2)
        job = next((j for j in c.call("GET", "/api/jobs")["jobs"] if j["id"] == jid), None)
        if job is None:
            return {"label": label, "error": "ジョブが消えました"}
        if job["state"] == "done":
            break
        if job["state"] == "failed":
            return {"label": label, "error": f"{job['error']['category']}: {job['error']['reason']}"}
        if job["error"] and job["error"].get("will_retry"):
            print(f"    … {job['error']['reason']}（自動再試行待ち）", flush=True)
            time.sleep(20)
    size, received = c.call("GET", f"/api/jobs/{jid}/file", raw=True)
    job = next(j for j in c.call("GET", "/api/jobs")["jobs"] if j["id"] == jid)
    return {"label": label, "id": jid, "login": job["login_label"], "format": job["format_note"] or "",
            "timing": job["timing"], "size": size, "received": received, "est_text": opt["time_text"]}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("urls", nargs="*")
    ap.add_argument("--base", default="http://127.0.0.1:8080")
    ap.add_argument("--token", required=True)
    ap.add_argument("--login", choices=("both", "none", "with"), default="both")
    ap.add_argument("--expect", action="append", default=[], metavar="分類=URL")
    ap.add_argument("--keep", action="store_true", help="試験で作ったジョブを削除しない")
    a = ap.parse_args()
    c = Client(a.base, a.token)
    try:
        status = c.call("GET", "/api/admin/status")
    except urllib.error.URLError as e:
        print(f"サーバーに接続できません: {e}")
        return 2
    original = {x["site"]: x["mode"] for x in status["logins"]}
    available = {x["site"]: x["status"] != "unset" for x in status["logins"]}
    env = status["health"].get("environment") or {}
    print(f"yt-dlp {env.get('ytdlp_version')} / Deno {env.get('deno')} / チャンネル {status['ytdlp']['channel']}\n")
    rows, made = [], []
    try:
        for url in a.urls:
            site = c.call("POST", "/api/preview", {"url": url}).get("site", "generic")
            modes = {"both": ["never", "always"], "none": ["never"], "with": ["always"]}[a.login]
            if site not in original:
                modes = ["never"]          # ログイン設定のないサイトは1回だけ
            for mode in modes:
                if site in original:
                    if mode == "always" and not available.get(site):
                        print(f"[{site}] ログイン情報が未設定のため「ログインあり」は省略します")
                        continue
                    c.call("PUT", "/api/admin/settings", {"login_mode": {site: mode}})
                for kind, quality in PRESETS:
                    label = f"{site} {kind.upper()}{quality and ' ' + quality} {'ログインあり' if mode == 'always' else 'ログインなし'}"
                    print(f"実行中: {label}", flush=True)
                    r = run_one(c, url, kind, quality, label)
                    rows.append(r)
                    if "id" in r:
                        made.append(r["id"])
    finally:
        for site, mode in original.items():
            c.call("PUT", "/api/admin/settings", {"login_mode": {site: mode}})
    if rows:
        print("\n===== 見積もりと実測（秒） =====")
        print("条件 ｜ 取得: 見積/実測 ｜ 変換: 見積/実測 ｜ スマホへ: 見積/実測 ｜ 合計: 見積/実測 ｜ ログイン ｜ 取得形式")
        for r in rows:
            if "error" in r:
                print(f"{r['label']} ｜ 失敗: {r['error']}")
                continue
            t = r["timing"]
            est_total = sum(t[k] or 0 for k in ("est_fetch", "est_convert", "est_transfer"))
            act_total = sum(t[k] or 0 for k in ("act_fetch", "act_convert", "act_transfer"))
            print(f"{r['label']} ｜ {secs(t['est_fetch'])}/{secs(t['act_fetch'])} ｜ "
                  f"{secs(t['est_convert'])}/{secs(t['act_convert'])} ｜ "
                  f"{secs(t['est_transfer'])}/{secs(t['act_transfer'])} ｜ {secs(est_total)}/{secs(act_total)} ｜ "
                  f"{r['login']} ｜ {r['format']}（{r['size'] / 1e6:.1f}MB）")
            print(f"    画面の表示: {r['est_text']}")
    ok = True
    for item in a.expect:
        want, _, url = item.partition("=")
        pre = c.call("POST", "/api/preview", {"url": url})
        got = "(成功)" if pre.get("ok") else pre["error"]["category"]
        mark = "OK " if got == want else "NG "
        ok &= got == want
        print(f"{mark} 期待 {want:<16} 実際 {got:<16} {'' if pre.get('ok') else pre['error']['reason']}  {url}")
    if not a.keep:
        for jid in made:
            try:
                c.call("DELETE", f"/api/jobs/{jid}")
            except urllib.error.HTTPError:
                pass
    acc = c.call("GET", "/api/admin/status")["accuracy"]
    print("\n平均誤差（管理画面と同じ値）:", json.dumps(acc, ensure_ascii=False))
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())

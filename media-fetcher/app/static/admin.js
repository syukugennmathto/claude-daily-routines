import { h, api, toast, clock, bytes, busy } from "/static/common.js";

const $ = (id) => document.getElementById(id);
const MODES = { always: "常に使う", on_failure: "失敗時のみ使う", never: "使わない" };
const OPS = { mp3: "MP3エンコード", wav: "WAV変換", mp4_merge: "MP4結合（再エンコードなし）", mp4_reencode: "H.264再エンコード（720p換算）" };

function action(label, fn, cls) {
  return h("button", { class: "small " + (cls || ""), type: "button", onclick: (e) => busy(e.currentTarget, async () => { await fn(); await load(); }) }, label);
}
function fill(id, ...items) { $(id).replaceChildren(...items.flat().filter((x) => x != null && x !== false)); }
const mark = (ok) => h("span", { class: ok ? "ok" : "err" }, ok ? "○ " : "× ");

function renderHealth(s) {
  const env = s.health.environment || {};
  const rows = [
    h("div", null, mark(!!env.ytdlp_version), `yt-dlp：${env.ytdlp_version || "読み込めません"}`),
    h("div", null, mark(!!env.deno && env.deno_supported), `Deno（JavaScript実行環境）：${env.deno ? env.deno + (env.deno_supported ? "" : "（古すぎます）") : "認識されていません"}`),
    h("div", null, mark(!!env.ejs), `yt-dlp-ejs（JSチャレンジ解決用）：${env.ejs ? "導入済み" : "見つかりません"}`),
    h("div", null, mark(env.ffmpeg !== false), `ffmpeg：${env.ffmpeg === false ? "見つかりません" : "利用可能"}`),
  ];
  for (const p of env.problems || []) rows.push(h("div", { class: "errbox" }, h("div", { class: "err" }, p)));
  for (const site of s.health.sites) {
    const r = site.result;
    rows.push(h("h3", null, site.label));
    rows.push(h("div", { class: "muted" }, `ログイン状態：${site.login_status_label}`));
    if (!site.configured) { rows.push(h("div", { class: "muted" }, "診断用URLが未設定です（.env の HEALTHCHECK_URL_… に公開動画のURLを設定してください）。")); continue; }
    if (!r) { rows.push(h("div", { class: "muted" }, "まだ診断していません。")); continue; }
    rows.push(h("div", null, mark(!!r.meta_ok), "メタデータ取得　", mark(!!r.download_ok), "短い区間のダウンロード"));
    rows.push(h("div", { class: "muted" }, `${clock(r.ran_at)} 実行・${r.seconds}秒・yt-dlp ${r.ytdlp_version || "?"}・${r.used_login ? "ログインあり" : "ログインなし"}`));
    if (!r.ok) {
      rows.push(h("div", { class: "errbox" }, h("div", { class: "err" }, r.reason || "失敗しました"),
        h("div", { class: "muted" }, "原因候補：" + (r.hint || "不明")),
        h("details", null, h("summary", null, "詳細"), h("pre", null, r.detail || ""))));
    }
  }
  rows.push(h("div", { class: "actions" }, action("今すぐ診断する", () => api("POST", "/api/admin/healthcheck"), "primary"),
    h("span", { class: "muted" }, s.health.last_run ? `前回：${clock(s.health.last_run)}` : "")));
  fill("health-body", rows);
  $("health-body").className = "";
}

function renderLogin(s) {
  const rows = [];
  for (const l of s.logins) {
    const cls = l.status === "valid" ? "ok" : l.status === "expired" ? "err" : "muted";
    const file = h("input", { type: "file", class: "hidden", accept: ".txt,text/plain" });
    file.addEventListener("change", async () => {
      if (!file.files[0]) return;
      try {
        const r = await api("PUT", `/api/admin/cookies/${l.site}`, undefined, await file.files[0].text());
        toast(r.status === "valid" ? "Cookieを保存しました。" : "保存しましたが問題があります：" + r.detail);
      } catch (e) { toast(e.message); }
      load();
    });
    const sel = h("select", { "aria-label": l.label + " のログインモード", onchange: async (e) => {
      try { await api("PUT", "/api/admin/settings", { login_mode: { [l.site]: e.target.value } }); toast("保存しました。"); } catch (err) { toast(err.message); }
      load();
    } }, Object.entries(MODES).map(([k, v]) => h("option", { value: k, selected: k === l.mode }, v)));
    rows.push(h("h3", null, l.label),
      h("div", null, "状態：", h("span", { class: cls }, l.status_label),
        l.method ? h("span", { class: "muted" }, `（${l.method === "cookies" ? "cookies.txt" : ".env のID/パスワード"}）`) : null),
      l.status === "expired" ? h("div", { class: "err" }, (l.method === "cookies" ? "Cookie期限切れ：再設定してください。" : "ログイン情報が無効です：.env を確認してください。")) : null,
      l.detail ? h("div", { class: "muted" }, l.detail) : null,
      h("div", { class: "row" }, h("span", null, "ログインモード："), sel),
      h("div", { class: "actions" }, file,
        h("button", { class: "small", type: "button", onclick: () => file.click() }, l.has_cookie ? "cookies.txt を差し替え" : "cookies.txt をアップロード"),
        l.has_cookie ? action("Cookieを削除", async () => { if (confirm("削除しますか？")) await api("DELETE", `/api/admin/cookies/${l.site}`); }, "danger") : null));
    if (l.site === "niconico") rows.push(h("div", { class: "muted" }, s.settings.niconico_password_set ? ".env にID/パスワードが設定されています（cookies.txt があればそちらを優先）。" : ".env の NICONICO_USERNAME / NICONICO_PASSWORD でもログインできます。"));
  }
  rows.push(h("p", { class: "muted" }, "自分のアカウントを使うと、サイト側の規約によりアカウントが停止されるおそれがあります。詳しくは README を確認してください。"));
  fill("login-body", rows);
  $("login-body").className = "";
}

function renderYtdlp(s) {
  const y = s.ytdlp;
  const name = (v) => (v === "bundled" ? "同梱版" : v) || "なし";
  const other = y.channel === "stable" ? "nightly" : "stable";
  fill("ytdlp-body", 
    h("div", null, `使用中：${name(y.current)}（チャンネル：${y.channel}）`),
    h("div", { class: "muted" }, `前のバージョン：${name(y.previous)}`),
    h("div", { class: "muted" }, `自動更新：${s.settings.auto_update ? `起動時と毎日 ${s.settings.daily_hour} 時台` : "無効"}・最終確認：${y.last_check ? clock(y.last_check) : "未実行"}`),
    y.bad.length ? h("div", { class: "warn" }, `自己診断に失敗した版：${y.bad.join(", ")}`) : null,
    h("div", { class: "actions" },
      action("更新", async () => toast((await api("POST", "/api/admin/update")).message), "primary"),
      action(`${other} に切替`, async () => toast((await api("POST", "/api/admin/channel", { channel: other })).message)),
      y.previous ? action("ロールバック", async () => { if (confirm(`${name(y.previous)} に戻しますか？`)) toast((await api("POST", "/api/admin/rollback")).message); }) : null),
    h("details", null, h("summary", null, "更新履歴"),
      h("pre", null, y.history.map((u) => `${clock(u.ran_at)} ${u.ok ? "○" : "×"} ${u.message}`).join("\n") || "履歴はありません")));
  $("ytdlp-body").className = "";
}

function renderEstimate(s) {
  const acc = (label, a) => h("tr", null, h("td", null, label),
    h("td", null, a ? `${a.mean_abs_pct}%` : "—"),
    h("td", null, a ? `${a.bias_pct > 0 ? "長め" : "短め"}に ${Math.abs(a.bias_pct)}%` : "—"),
    h("td", null, a ? `${a.count}件` : "0件"));
  const learned = (b) => h("span", { class: "muted" }, b ? "（実測）" : "（既定値）");
  const r = s.rates;
  fill("estimate-body", 
    h("h3", null, "見積もりと実測の平均誤差（直近20件）"),
    h("table", null, h("thead", null, h("tr", null, ["工程", "平均誤差", "傾向", "件数"].map((t) => h("th", null, t)))),
      h("tbody", null, acc("取得", s.accuracy.fetch), acc("変換", s.accuracy.convert), acc("取得＋変換", s.accuracy.server_total), acc("スマホへ転送", s.accuracy.transfer))),
    h("h3", null, "現在の速度・倍率"),
    h("table", null, h("tbody", null,
      Object.values(r.sites).map((v) => h("tr", null, h("td", null, v.label + " の取得"), h("td", null, `${v.download_mbps} Mbps・固定 ${v.overhead_s}秒 `, learned(v.learned)))),
      h("tr", null, h("td", null, "スマホへの転送"), h("td", null, `${r.transfer.mbps} Mbps `, learned(r.transfer.learned))),
      Object.entries(r.conversion).map(([k, v]) => h("tr", null, h("td", null, OPS[k] || k), h("td", null, `${v.rate}倍速 `, learned(v.learned)))))),
    h("div", { class: "muted" }, s.benchmark ? `ベンチマーク実行：${clock(s.benchmark.ran_at)}` : "ベンチマークは未実行です。"),
    h("div", { class: "actions" },
      action("ベンチマークを再実行", async () => { await api("POST", "/api/admin/estimator/bench"); toast("変換速度を測り直しました。"); }),
      action("回線速度の学習をリセット", async () => { if (confirm("取得・転送速度の実測値を消して既定値に戻しますか？")) { await api("POST", "/api/admin/estimator/reset"); toast("リセットしました。"); } }, "danger")));
  $("estimate-body").className = "";
}

function renderMisc(s) {
  const sel = h("select", { "aria-label": "同時実行数", onchange: async (e) => {
    try { await api("PUT", "/api/admin/settings", { concurrency: Number(e.target.value) }); toast("保存しました。"); } catch (err) { toast(err.message); }
  } }, [1, 2].map((n) => h("option", { value: n, selected: n === s.settings.concurrency }, `${n}件`)));
  fill("misc-body", 
    h("div", { class: "row" }, h("span", null, "同時実行数："), sel),
    h("div", { class: "muted" }, "増やすとサイト側に一時ブロックされやすくなります。通常は1件のままにしてください。"),
    h("div", null, `サーバーの空き容量：${bytes(s.disk.free)} / ${bytes(s.disk.total)}`),
    h("div", { class: "muted" }, `完了ファイルは ${s.settings.retention_days} 日後に自動削除されます。`),
    h("div", { class: "actions" }, h("button", { class: "small", type: "button", onclick: async () => { await api("POST", "/api/logout"); location.href = "/login"; } }, "ログアウト")));
  $("misc-body").className = "";
}

async function load() {
  let s;
  try { s = await api("GET", "/api/admin/status"); } catch (e) { toast(e.message); return; }
  $("banners").replaceChildren(...s.banners.map((b) => h("div", { class: "banner", role: "alert" }, b.message)));
  renderHealth(s); renderLogin(s); renderYtdlp(s); renderEstimate(s); renderMisc(s);
}
load().then(() => { if (location.hash) document.querySelector(location.hash)?.scrollIntoView(); });

import { h, api, toast, clock, duration, busy, errorBox } from "/static/common.js";

const $ = (id) => document.getElementById(id);
const urlInput = $("url"), previewEl = $("preview"), jobsEl = $("jobs");
const openDetails = new Set();
let selectedKey = localStorage.getItem("preset") || "mp3:192";

if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

// ---- プレビュー ----
async function runPreview() {
  const url = urlInput.value.trim();
  if (!url) return;
  previewEl.replaceChildren(h("div", { class: "card muted" }, "動画の情報を確認しています…（10〜30秒ほどかかることがあります）"));
  let p;
  try { p = await api("POST", "/api/preview", { url, playlist_all: $("playlist-all").checked }); }
  catch (e) { previewEl.replaceChildren(h("div", { class: "card err" }, e.message)); return; }
  if (!p.ok) {
    previewEl.replaceChildren(h("div", { class: "card" }, h("h2", null, "取得できません"), errorBox(p.error, {}, { open: false })));
    return;
  }
  renderPreview(p);
}

function renderPreview(p) {
  if (!p.options.some((o) => o.key === selectedKey)) selectedKey = "mp3:192";
  const list = h("ul", { class: "options" }, p.options.map((o) =>
    h("li", null, h("label", null,
      h("input", { type: "radio", name: "preset", value: o.key, checked: o.key === selectedKey,
        onchange: () => { selectedKey = o.key; localStorage.setItem("preset", o.key); } }),
      h("div", { class: "grow" },
        h("div", { class: "opt-head" }, h("span", null, o.label), h("span", null, o.size_text)),
        h("div", { class: "muted" }, o.time_text),
        o.format_note ? h("div", { class: "muted" }, "取得形式：" + o.format_note) : null,
        o.note ? h("div", { class: o.reencode ? "warn" : "muted" }, o.note) : null)))));
  const add = h("button", { class: "primary grow", type: "button" }, p.playlist ? `${p.count}件を追加` : "追加");
  add.addEventListener("click", () => busy(add, async () => {
    const o = p.options.find((x) => x.key === selectedKey);
    const r = await api("POST", "/api/jobs", { url: p.url, token: p.token, kind: o.kind, quality: o.quality, playlist_all: p.playlist });
    toast(`${r.ids.length}件を追加しました。画面を閉じても処理は続きます。`);
    previewEl.replaceChildren();
    urlInput.value = "";
    refresh();
  }));
  const head = h("div", { class: "media" },
    p.thumbnail ? h("img", { class: "thumb", src: p.thumbnail, alt: "", referrerPolicy: "no-referrer", loading: "lazy" }) : null,
    h("div", { class: "grow" },
      h("div", { class: "title" }, p.title || "(無題)"),
      h("div", { class: "muted" }, [p.site_label, p.playlist ? `プレイリスト ${p.count}件` : duration(p.duration),
        p.used_login ? "ログインあり" : "ログインなし"].filter(Boolean).join("・"))));
  const extra = p.playlist
    ? h("details", null, h("summary", null, "含まれる動画"), h("pre", null, p.items.map((i, n) => `${n + 1}. ${i.title}${i.duration ? "（" + duration(i.duration) + "）" : ""}`).join("\n")))
    : null;
  previewEl.replaceChildren(h("div", { class: "card" }, head, extra, list,
    h("p", { class: "muted" }, "時間はすべて目安です。使うほど実測に合わせて補正されます。"),
    h("div", { class: "actions" }, add,
      h("button", { type: "button", onclick: () => previewEl.replaceChildren() }, "閉じる"))));
}

$("url-form").addEventListener("submit", (e) => { e.preventDefault(); busy($("check"), runPreview); });
$("paste").addEventListener("click", async () => {
  try {
    const t = await navigator.clipboard.readText();
    const m = t.match(/https?:\/\/\S+/);
    if (m) { urlInput.value = m[0]; busy($("check"), runPreview); } else toast("クリップボードにURLがありません。");
  } catch (e) { toast("貼り付けできません。入力欄を長押しして貼り付けてください。"); }
});

// ---- ジョブ一覧 ----
function jobCard(j) {
  const retry = (body) => async () => { await api("POST", `/api/jobs/${j.id}/retry`, body || {}); toast("再試行します。"); refresh(); };
  const running = j.state === "downloading" || j.state === "converting";
  const meta = [j.preset_label, j.site_label, duration(j.duration), j.size_text, j.login_label].filter(Boolean).join("・");
  const card = h("div", { class: "card" },
    h("div", { class: "media" },
      j.thumbnail ? h("img", { class: "thumb", src: j.thumbnail, alt: "", referrerPolicy: "no-referrer", loading: "lazy" }) : null,
      h("div", { class: "grow" },
        h("div", { class: "title" }, j.title || j.url),
        h("div", { class: "muted" }, meta))),
    h("div", { class: "row" },
      h("span", { class: "badge s-" + j.state }, j.state_label),
      running ? h("span", { class: "muted" }, Math.round(j.progress) + "%") : null,
      j.eta_text ? h("span", { class: "muted" }, j.eta_text) : null),
    running ? h("progress", { max: 100, value: j.progress, "aria-label": "進捗" }) : null,
    j.format_note ? h("div", { class: "muted" }, "取得形式：" + j.format_note) : null,
    j.state !== "done" && j.estimate_text && !j.error ? h("div", { class: "muted" }, "見積もり：" + j.estimate_text) : null,
    j.state === "done" ? h("div", { class: "muted" }, [j.actual_text, j.estimate_text ? "見積もり：" + j.estimate_text : null,
      j.expires_at ? `${clock(j.expires_at)} に自動削除` : null].filter(Boolean).join(" ／ ")) : null);
  if (j.error) {
    card.append(errorBox(j.error, { retry: retry(), retryLogin: retry({ use_login: true }), retryUpdate: retry({ update_first: true }) },
      { key: String(j.id), open: openDetails.has(String(j.id)), nextAttemptAt: j.next_attempt_at }));
  }
  const actions = h("div", { class: "actions" });
  if (j.download_url) actions.append(h("a", { class: "btn primary grow", href: j.download_url, download: j.file_name }, "ダウンロード"));
  if (j.state === "failed" && j.error && j.error.action === "none") actions.append(h("button", { class: "small", type: "button", onclick: (e) => busy(e.currentTarget, retry()) }, "再試行"));
  actions.append(h("button", { class: "small danger", type: "button", onclick: async (e) => {
    if (!confirm(running ? "処理を中止して削除しますか？" : "削除しますか？")) return;
    await busy(e.currentTarget, async () => { await api("DELETE", `/api/jobs/${j.id}`); refresh(); });
  } }, running ? "中止" : "削除"));
  card.append(actions);
  return card;
}

let refreshing = false;
async function refresh() {
  if (refreshing) return;
  refreshing = true;
  try {
    const data = await api("GET", "/api/jobs");
    jobsEl.querySelectorAll("details").forEach((d) => { d.open ? openDetails.add(d.dataset.key) : openDetails.delete(d.dataset.key); });
    jobsEl.replaceChildren(...data.jobs.map(jobCard));
    $("empty").classList.toggle("hidden", data.jobs.length > 0);
    $("banners").replaceChildren(...data.banners.map((b) =>
      h("div", { class: "banner", role: "alert" }, b.message + " ", h("a", { href: "/admin#login" }, "設定を開く"))));
  } catch (e) { /* 一時的な通信エラーは次回に任せる */ }
  finally { refreshing = false; }
}

// 画面を開いている間だけ定期的に更新する。開き直したときは即時に最新状態を取る。
setInterval(() => { if (!document.hidden) refresh(); }, 2500);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
window.addEventListener("pageshow", refresh);

// 共有メニュー（Web Share Target）や ?share=URL で開かれたら、自動で「確認」まで進める
const shared = new URLSearchParams(location.search).get("share");
if (shared) {
  urlInput.value = shared;
  history.replaceState(null, "", "/");
  busy($("check"), runPreview);
}
refresh();

// 画面共通の小さな道具。innerHTML は使わず、必ず textContent で組み立てる。
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k in el && k !== "list") el[k] = v;
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}

export async function api(method, path, body, raw) {
  const opts = { method, headers: { "X-App": "1" }, credentials: "same-origin" };
  if (raw !== undefined) { opts.body = raw; opts.headers["Content-Type"] = "text/plain"; }
  else if (body !== undefined) { opts.body = JSON.stringify(body); opts.headers["Content-Type"] = "application/json"; }
  const res = await fetch(path, opts);
  if (res.status === 401) { location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search); throw new Error("認証が必要です"); }
  let data = null;
  try { data = await res.json(); } catch (e) { /* 本文なし */ }
  if (!res.ok) throw new Error((data && data.detail) || `エラー (${res.status})`);
  return data;
}

let toastTimer;
export function toast(msg) {
  document.querySelectorAll(".toast").forEach((e) => e.remove());
  const el = h("div", { class: "toast", role: "status" }, msg);
  document.body.append(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 4000);
}

export function clock(ts) {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  const same = d.toDateString() === new Date().toDateString();
  const hm = d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  return same ? hm : `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}

export function duration(sec) {
  if (!sec && sec !== 0) return "";
  sec = Math.round(sec);
  const hh = Math.floor(sec / 3600), mm = Math.floor((sec % 3600) / 60), ss = sec % 60;
  return (hh ? hh + ":" + String(mm).padStart(2, "0") : mm) + ":" + String(ss).padStart(2, "0");
}

export function bytes(n) {
  if (!n) return "不明";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return (n < 100 ? n.toFixed(1) : Math.round(n)) + u[i];
}

export async function busy(button, fn) {
  const label = button.textContent;
  button.disabled = true;
  button.textContent = "処理中…";
  try { return await fn(); }
  catch (e) { toast(e.message); }
  finally { button.disabled = false; button.textContent = label; }
}

// 取得不可の理由表示：1.理由 2.次にできること 3.詳細（折りたたみ）
export function errorBox(err, handlers = {}, ctx = {}) {
  const actions = [];
  const link = (text, href) => h("a", { class: "btn small", href }, text);
  const btn = (text, fn) => h("button", { class: "small", type: "button", onclick: (e) => busy(e.currentTarget, fn) }, text);
  let next = err.hint || "";
  switch (err.action) {
    case "login_retry":
      if (err.login_available && handlers.retryLogin) actions.push(btn("ログインして再試行", handlers.retryLogin));
      else { actions.push(link("ログイン設定へ", "/admin#login")); next = "Cookie（ログイン情報）が未設定です。設定画面で登録してください。"; }
      break;
    case "reset_cookie":
      actions.push(link("Cookieを再設定", "/admin#login"));
      break;
    case "retry_after_live":
      if (err.release_timestamp) next = `開始予定：${clock(err.release_timestamp)}。配信が終了してから再試行してください。`;
      if (handlers.retry) actions.push(btn("配信終了後に再試行", handlers.retry));
      break;
    case "auto_retry":
      if (err.will_retry && ctx.nextAttemptAt) next = `時間を置いて自動で再試行します（次の再試行：${clock(ctx.nextAttemptAt)}）。` + (err.category === "bot_block" ? "続く場合は、サーバーが自宅回線で動いているか確認してください。" : "");
      else if (err.category === "bot_block") next = "自動再試行の上限に達しました。数時間おいてから再試行してください。続く場合は、サーバーが自宅回線で動いているか確認してください。";
      if (handlers.retry) actions.push(btn("今すぐ再試行", handlers.retry));
      break;
    case "update_retry":
      if (handlers.retryUpdate) actions.push(btn("yt-dlpを更新して再試行", handlers.retryUpdate));
      else actions.push(link("管理画面で更新", "/admin#ytdlp"));
      break;
    case "retry":
      if (handlers.retry) actions.push(btn("再試行", handlers.retry));
      break;
    default:
      if (!next) next = err.category === "invalid_url" ? "URLを確認してください。" : "この動画は取得できません。";
  }
  if (err.will_retry && err.action !== "auto_retry" && ctx.nextAttemptAt) next += `（自動再試行：${clock(ctx.nextAttemptAt)}）`;
  const box = h("div", { class: "errbox" + (err.will_retry ? " retrying" : "") },
    h("div", { class: err.will_retry ? "warn" : "err" }, err.reason),
    next ? h("div", { class: "muted" }, next) : null,
    actions.length ? h("div", { class: "actions" }, actions) : null);
  if (err.detail) {
    const d = h("details", { dataset: { key: ctx.key || "" } }, h("summary", null, "詳細"), h("pre", null, err.detail));
    if (ctx.open) d.open = true;
    box.append(d);
  }
  return box;
}

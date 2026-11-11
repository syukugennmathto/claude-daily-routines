document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("msg");
  msg.textContent = "";
  const res = await fetch("/api/login", {
    method: "POST", credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-App": "1" },
    body: JSON.stringify({ token: document.getElementById("token").value }),
  });
  if (res.ok) {
    const next = new URLSearchParams(location.search).get("next") || "/";
    // 自サイト内のパスだけに戻す
    location.href = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  } else {
    let d = {};
    try { d = await res.json(); } catch (err) { /* 本文なし */ }
    msg.textContent = d.detail || "ログインできませんでした。";
  }
});

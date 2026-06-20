// 進路も分散してみませんか — 明治大学附属世田谷高校 高1 / 50分版（35枚）
// v6（明聖・高3・20分）ベース。世田谷向けに調整し、内容を35枚へ拡張。
// 生成: node build_slides.js  ->  build/career_talk_setagaya.pptx
const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "W16x9", width: 13.333, height: 7.5 });
pptx.layout = "W16x9";
pptx.author = "植元 雅斗";
pptx.title = "進路も分散してみませんか";

// ---- パレット（v6踏襲） ----
const C = {
  bg:     "14223A", card:   "1B2942", cardLt: "22324F", border: "33455F",
  white:  "FFFFFF", muted:  "8294AE", sub:    "AEBED4",
  teal:   "2EC4B6", orange: "F4A261", coral:  "E76F51",
  green:  "2A9D8F", green2: "52B788", purple: "9B7BFF", blue:   "5C9DE0",
};
const FONT = "IPAGothic";
let TOTAL = 35;

function bg(s) { s.background = { color: C.bg }; }
function footer(s, n) {
  s.addText(`${n}/${TOTAL}`, { x: 11.9, y: 6.95, w: 1.3, h: 0.4, align: "right",
    fontSize: 12, color: C.muted, fontFace: FONT });
}
function hint(s, t) {
  s.addText(t, { x: 0.5, y: 6.85, w: 11.2, h: 0.5, align: "center",
    fontSize: 16, color: C.muted, italic: true, fontFace: FONT });
}
function title(s, t, color = C.white) {
  s.addText(t, { x: 0.4, y: 0.35, w: 12.5, h: 0.95, align: "center",
    fontSize: 34, bold: true, color, fontFace: FONT });
}
function newSlide() { const s = pptx.addSlide(); bg(s); return s; }

// 縦並びの帯リスト（左アクセントバー付き）
function barList(s, rows, opt = {}) {
  const x = opt.x ?? 1.0, w = opt.w ?? 11.33, h = opt.h ?? 1.0, gap = opt.gap ?? 0.22;
  let y = opt.y ?? 1.7;
  rows.forEach(r => {
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape("rect", { x, y, w: 0.16, h, fill: { color: r.c } });
    if (r.sub) {
      s.addText(r.main, { x: x + 0.4, y: y + 0.1, w: w - 0.7, h: h * 0.55, valign: "middle",
        fontSize: opt.fs ?? 22, bold: true, color: C.white, fontFace: FONT });
      s.addText(r.sub, { x: x + 0.4, y: y + h * 0.55, w: w - 0.7, h: h * 0.4, valign: "middle",
        fontSize: 14, color: C.muted, fontFace: FONT });
    } else {
      s.addText(r.main, { x: x + 0.4, y, w: w - 0.7, h, valign: "middle",
        fontSize: opt.fs ?? 22, bold: true, color: C.white, fontFace: FONT });
    }
    y += h + gap;
  });
}

let N = 0; // スライド番号カウンタ

// =====================================================================
// 1. 表紙
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addShape("rect", { x: 0, y: 3.45, w: 13.333, h: 0.05, fill: { color: C.teal } });
  s.addText("進路も分散してみませんか", { x: 0.5, y: 2.1, w: 12.3, h: 1.2, align: "center",
    fontSize: 50, bold: true, color: C.white, fontFace: FONT });
  s.addText("〜 好きも、進路も、複数あっていい 〜", { x: 0.5, y: 3.55, w: 12.3, h: 0.7,
    align: "center", fontSize: 22, color: C.teal, fontFace: FONT });
  s.addText("植元 雅斗", { x: 0.5, y: 4.6, w: 12.3, h: 0.6, align: "center",
    fontSize: 24, bold: true, color: C.white, fontFace: FONT });
  s.addText("明治大学附属世田谷高校 / 2026.7.9", { x: 0.5, y: 5.3, w: 12.3, h: 0.5,
    align: "center", fontSize: 16, color: C.muted, fontFace: FONT });
  footer(s, N);
})();

// =====================================================================
// 2. 今日のゴール
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "今日のゴール");
  s.addShape("roundRect", { x: 1.8, y: 2.1, w: 9.73, h: 3.0, rectRadius: 0.12,
    fill: { color: C.cardLt }, line: { color: C.orange, width: 1.75 } });
  s.addText("持ち帰ってほしいのは、たった1つ", { x: 1.8, y: 2.45, w: 9.73, h: 0.7,
    align: "center", fontSize: 22, color: C.muted, fontFace: FONT });
  s.addText("「進路も、好きも、複数あっていい」", { x: 1.8, y: 3.25, w: 9.73, h: 1.1,
    align: "center", fontSize: 32, bold: true, color: C.white, fontFace: FONT });
  s.addText("全部は覚えなくてOK。これ1つだけ。", { x: 1.8, y: 4.35, w: 9.73, h: 0.6,
    align: "center", fontSize: 18, color: C.orange, fontFace: FONT });
  footer(s, N);
})();

// =====================================================================
// 3. 今日の流れ
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "今日の流れ");
  barList(s, [
    { c: C.teal,   main: "① 自己紹介 — ちょっと変わった大人の話", sub: "本業のかたわら、色々やっています" },
    { c: C.orange, main: "② ワーク — 仕事に何を求める？",         sub: "書いて、何人かに聞きます" },
    { c: C.purple, main: "③ 「分散」という考え方",                 sub: "一つに全部を賭けない、という発想" },
    { c: C.green2, main: "④ 進路の話 ＆ Q&A",                      sub: "最後はなんでも聞いてください" },
  ], { y: 1.75, h: 1.05, gap: 0.2 });
  footer(s, N);
})();

// =====================================================================
// 4. アイスブレイク
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("将来やりたいこと、\nもう決まってる人？", { x: 0.5, y: 1.9, w: 12.3, h: 2.0,
    align: "center", fontSize: 42, bold: true, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.15 });
  s.addText("決まってなくて全然OK。\n今日はむしろ「今は決めなくていい」という話をします。",
    { x: 0.5, y: 4.4, w: 12.3, h: 1.2, align: "center",
      fontSize: 20, color: C.teal, fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "（手を挙げてもらう／その場で2〜3人に聞く）");
  footer(s, N);
})();

// =====================================================================
// 5. 集中と分散：働き方の考え方
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "集中と分散：働き方の考え方");
  const cards = [
    { x: 1.0, accent: C.coral, head: "集中（Concentration）", emoji: "🔦",
      big: "多くの自分を投下して\n臨むこと", sub: "「一点突破」で最大のエネルギーを注ぐ" },
    { x: 7.0, accent: C.teal, head: "分散（Diversion）", emoji: "🌳",
      big: "リスクも自分も分けて、\n活動すること", sub: "バランスを保ち、長く続ける生存戦略" },
  ];
  cards.forEach(c => {
    s.addShape("roundRect", { x: c.x, y: 1.55, w: 5.3, h: 4.5, rectRadius: 0.12,
      fill: { color: C.card }, line: { color: c.accent, width: 1.5 } });
    s.addText(c.head, { x: c.x, y: 1.85, w: 5.3, h: 0.6, align: "center",
      fontSize: 24, bold: true, color: c.accent, fontFace: FONT });
    s.addText(c.emoji, { x: c.x, y: 2.5, w: 5.3, h: 1.0, align: "center", fontSize: 44, fontFace: FONT });
    s.addText(c.big, { x: c.x + 0.3, y: 3.6, w: 4.7, h: 1.3, align: "center",
      fontSize: 23, bold: true, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.1 });
    s.addText(c.sub, { x: c.x + 0.3, y: 5.1, w: 4.7, h: 0.7, align: "center",
      fontSize: 14, color: C.muted, fontFace: FONT });
  });
  hint(s, "※岡田斗司夫さんの「分散の考え方」を参考に……");
  footer(s, N);
})();

// =====================================================================
// 6. 進路も分散してみませんか + 活動グリッド（6分類）※タイトル維持
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("進路も分散してみませんか", { x: 0.4, y: 0.25, w: 12.5, h: 0.9, align: "center",
    fontSize: 36, bold: true, color: C.white, fontFace: FONT });
  s.addText([
    { text: "植元 雅斗", options: { fontSize: 22, bold: true, color: C.white } },
    { text: "　私の色々な活動", options: { fontSize: 16, color: C.muted } },
  ], { x: 0.7, y: 1.2, w: 12, h: 0.5, fontFace: FONT });
  const grid = [
    { emoji: "💻", accent: C.teal,   head: "本業・正社員",     items: ["Dell Technologies"] },
    { emoji: "📷", accent: C.purple, head: "クリエイティブ",   items: ["フリーランスカメラマン", "YouTube・アプリ開発"] },
    { emoji: "🏫", accent: C.coral,  head: "教育・ベンチャー", items: ["まなびぱれっと", "教育系イベントの運営"] },
    { emoji: "📝", accent: C.green,  head: "執筆・メディア",   items: ["小説・同人誌", "ラジオの構成作家"] },
    { emoji: "🏛", accent: C.blue,   head: "コミュニティ",     items: ["コミケスタッフ"] },
    { emoji: "🚃", accent: C.green2, head: "趣味",             items: ["埼玉から岐阜まで在来線移動", "ラジオ/小説/映画"] },
  ];
  const cw = 3.95, ch = 1.95, gx = 0.55, gy = 0.25, x0 = 0.55, y0 = 1.75;
  grid.forEach((g, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = x0 + col * (cw + gx), y = y0 + row * (ch + gy);
    s.addShape("roundRect", { x, y, w: cw, h: ch, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: g.accent, width: 1.25 } });
    s.addText([
      { text: g.emoji + " ", options: { fontSize: 16 } },
      { text: g.head, options: { fontSize: 16, bold: true, color: g.accent } },
    ], { x: x + 0.2, y: y + 0.12, w: cw - 0.4, h: 0.5, fontFace: FONT });
    s.addText(g.items.join("\n"), { x: x + 0.25, y: y + 0.7, w: cw - 0.45, h: ch - 0.8,
      fontSize: 13, color: C.sub, fontFace: FONT, valign: "top", lineSpacingMultiple: 1.15 });
  });
  hint(s, "なんでこんなに色々やってるの？");
  footer(s, N);
})();

// =====================================================================
// 7. 人生目標 3層構造 ※維持
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "人生目標：「人と人の間に場を作り、間をなくす」", C.orange);
  const cols = [
    { x: 0.55, accent: C.teal,   head: "① 場を作る",      sub: "〜目標に直結する〜",
      items: ["TABOO", "コミケスタッフ", "ボカロDJ", "まなびハウス", "バス旅行の企画/運営/運転"] },
    { x: 4.74, accent: C.purple, head: "② 自分を拡張する", sub: "〜目標に間接的に寄与〜",
      items: ["小説", "YouTube", "同人誌"] },
    { x: 8.93, accent: C.coral,  head: "③ 生存戦略",      sub: "〜生きる為に必要〜",
      items: ["Dell（本業）", "カメラマン"] },
  ];
  cols.forEach(c => {
    s.addShape("roundRect", { x: c.x, y: 1.5, w: 3.85, h: 3.7, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: c.accent, width: 1.25 } });
    s.addText(c.head, { x: c.x, y: 1.65, w: 3.85, h: 0.45, align: "center",
      fontSize: 19, bold: true, color: c.accent, fontFace: FONT });
    s.addText(c.sub, { x: c.x, y: 2.12, w: 3.85, h: 0.35, align: "center",
      fontSize: 13, color: c.accent, fontFace: FONT });
    s.addText(c.items.map(t => "● " + t).join("\n"), { x: c.x + 0.3, y: 2.55, w: 3.3, h: 2.5,
      fontSize: 15, color: C.sub, fontFace: FONT, valign: "top", lineSpacingMultiple: 1.3 });
  });
  s.addShape("roundRect", { x: 0.55, y: 5.4, w: 12.23, h: 0.95, rectRadius: 0.08,
    fill: { color: C.cardLt }, line: { color: C.green2, width: 1.25 } });
  s.addText("これらの基となるたくさんのバイト in 学生時代", { x: 0.55, y: 5.4, w: 12.23, h: 0.95,
    align: "center", fontSize: 22, bold: true, color: C.white, fontFace: FONT });
  hint(s, "色々やってるけど、軸は1つ");
  footer(s, N);
})();

// =====================================================================
// 8. ある1週間の使い方（分散の実例）NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "分散って、具体的にはこういうこと");
  s.addText("僕のある1週間", { x: 0.6, y: 1.2, w: 12, h: 0.5, fontSize: 16, color: C.muted, fontFace: FONT });
  const blocks = [
    { c: C.teal,   when: "平日 9-18時", what: "Dell（本業）", note: "お金・安定" },
    { c: C.orange, when: "平日の夜",     what: "執筆・アプリ開発", note: "やりがい・成長" },
    { c: C.purple, when: "土曜",         what: "カメラ撮影 / 教育イベント", note: "成長・人とのつながり" },
    { c: C.green2, when: "日曜",         what: "コミケ準備 / ラジオ構成", note: "人間関係・好き" },
  ];
  let y = 1.75;
  blocks.forEach(b => {
    s.addShape("roundRect", { x: 1.0, y, w: 11.33, h: 1.0, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape("rect", { x: 1.0, y, w: 0.16, h: 1.0, fill: { color: b.c } });
    s.addText(b.when, { x: 1.35, y, w: 2.6, h: 1.0, valign: "middle",
      fontSize: 17, bold: true, color: b.c, fontFace: FONT });
    s.addText(b.what, { x: 4.1, y, w: 5.3, h: 1.0, valign: "middle",
      fontSize: 19, bold: true, color: C.white, fontFace: FONT });
    s.addText(b.note, { x: 9.5, y, w: 2.7, h: 1.0, valign: "middle", align: "right",
      fontSize: 14, color: C.muted, fontFace: FONT });
    y += 1.13;
  });
  hint(s, "一人の中に、いくつもの顔がある");
  footer(s, N);
})();

// =====================================================================
// 9. 学生時代のバイト/仕事歴（写真4枚）※維持
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("学生時代のバイト/仕事歴", { x: 0.6, y: 0.3, w: 12, h: 0.8,
    fontSize: 30, bold: true, color: C.green2, fontFace: FONT });
  const photos = [
    { img: "assets/photos/sanrio.png", cap: "サンリオ\nピューロランド レジ係", x: 0.7, y: 1.4 },
    { img: "assets/photos/radio.png",  cap: "アーティストの\nラジオ番組 構成作家",  x: 7.0, y: 1.4 },
    { img: "assets/photos/comike.png", cap: "コミケ スタッフ\n（更衣室担当）",      x: 0.7, y: 4.15 },
    { img: "assets/photos/intern.png", cap: "インターン2社同時\n（電車にPC忘れた）", x: 7.0, y: 4.15 },
  ];
  photos.forEach(p => {
    s.addShape("roundRect", { x: p.x, y: p.y, w: 2.5, h: 2.45, rectRadius: 0.06,
      fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addImage({ path: p.img, x: p.x + 0.12, y: p.y + 0.12, w: 2.26, h: 2.21, sizing: { type: "contain", w: 2.26, h: 2.21 } });
    s.addText(p.cap, { x: p.x + 2.65, y: p.y, w: 3.5, h: 2.45, valign: "middle",
      fontSize: 18, bold: true, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.15 });
  });
  hint(s, "いろんな仕事がありますが……");
  footer(s, N);
})();

// =====================================================================
// 10. 仕事に何を求めますか？？（問い）※維持
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("仕事に何を求めますか？？", { x: 0.5, y: 2.6, w: 12.3, h: 1.4, align: "center",
    fontSize: 46, bold: true, color: C.white, fontFace: FONT });
  s.addText("※複数OKです", { x: 0.5, y: 4.1, w: 12.3, h: 0.6, align: "center",
    fontSize: 20, color: C.muted, fontFace: FONT });
  footer(s, N);
})();

// =====================================================================
// 11. ★WORK① まず書いてみよう（2分）
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addShape("roundRect", { x: 4.4, y: 0.45, w: 4.5, h: 0.7, rectRadius: 0.35, fill: { color: C.orange } });
  s.addText("WORK ①  まず書いてみよう", { x: 4.4, y: 0.45, w: 4.5, h: 0.7, align: "center",
    fontSize: 20, bold: true, color: C.bg, fontFace: FONT });
  s.addText("仕事に求めるもの、ぜんぶ書き出してみよう", { x: 0.5, y: 1.4, w: 12.3, h: 0.8,
    align: "center", fontSize: 28, bold: true, color: C.white, fontFace: FONT });
  const chips = [
    { t: "給与", c: C.teal }, { t: "やりがい", c: C.orange }, { t: "成長", c: C.green2 },
    { t: "社会貢献", c: C.coral }, { t: "人間関係", c: C.purple },
  ];
  const cw = 2.15, gap = 0.25, totalW = chips.length * cw + (chips.length - 1) * gap;
  let cx = (13.333 - totalW) / 2;
  chips.forEach(ch => {
    s.addShape("roundRect", { x: cx, y: 2.45, w: cw, h: 0.95, rectRadius: 0.1,
      fill: { color: C.card }, line: { color: ch.c, width: 1.5 } });
    s.addText(ch.t, { x: cx, y: 2.45, w: cw, h: 0.95, align: "center",
      fontSize: 22, bold: true, color: ch.c, fontFace: FONT });
    cx += cw + gap;
  });
  s.addShape("roundRect", { x: 1.6, y: 3.9, w: 10.13, h: 2.2, rectRadius: 0.1,
    fill: { color: C.cardLt }, line: { color: C.orange, width: 1.25 } });
  s.addText([
    { text: "① 上の5つから、自分が大事だと思うものを選ぶ（複数OK）\n", options: { fontSize: 20, color: C.white, bold: true } },
    { text: "② 「なぜそれが大事か」を一言メモ\n", options: { fontSize: 20, color: C.white, bold: true } },
    { text: "③ 5つ以外でもOK（例：自由な時間、好きな人と働く…）", options: { fontSize: 20, color: C.white, bold: true } },
  ], { x: 2.0, y: 4.1, w: 9.3, h: 1.8, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.25 });
  s.addText("⏱ 制限時間 2分 — 紙でも、頭の中でもOK", { x: 0.5, y: 6.25, w: 12.3, h: 0.6,
    align: "center", fontSize: 22, bold: true, color: C.orange, fontFace: FONT });
  footer(s, N);
})();

// =====================================================================
// 12. ★WORK② みんなのを見てみよう（発表）
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addShape("roundRect", { x: 4.4, y: 0.45, w: 4.5, h: 0.7, rectRadius: 0.35, fill: { color: C.teal } });
  s.addText("WORK ②  みんなのを見てみよう", { x: 4.4, y: 0.45, w: 4.5, h: 0.7, align: "center",
    fontSize: 20, bold: true, color: C.bg, fontFace: FONT });
  s.addText("何人かに聞いてみます", { x: 0.5, y: 1.45, w: 12.3, h: 0.8,
    align: "center", fontSize: 30, bold: true, color: C.white, fontFace: FONT });
  const rows = [
    { c: C.teal,   t: "どれを選んだ？　いくつ選んだ？" },
    { c: C.orange, t: "一番大事なのはどれ？　その理由は？" },
    { c: C.purple, t: "5つ以外のものを書いた人、教えて" },
  ];
  let y = 2.6;
  rows.forEach(r => {
    s.addShape("roundRect", { x: 1.6, y, w: 10.13, h: 0.95, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape("rect", { x: 1.6, y, w: 0.14, h: 0.95, fill: { color: r.c } });
    s.addText(r.t, { x: 2.0, y, w: 9.5, h: 0.95, valign: "middle",
      fontSize: 22, bold: true, color: C.white, fontFace: FONT });
    y += 1.15;
  });
  s.addText("👉 答えは人によってバラバラ。それで正解。", { x: 0.5, y: 6.15, w: 12.3, h: 0.6,
    align: "center", fontSize: 22, bold: true, color: C.teal, fontFace: FONT });
  footer(s, N);
})();

// =====================================================================
// 13. 答えはバラバラでいい NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("答えは、人によってバラバラ", { x: 0.5, y: 2.1, w: 12.3, h: 1.0, align: "center",
    fontSize: 40, bold: true, color: C.white, fontFace: FONT });
  s.addText("それで、いい。", { x: 0.5, y: 3.3, w: 12.3, h: 0.9, align: "center",
    fontSize: 36, bold: true, color: C.teal, fontFace: FONT });
  s.addText("でも——全部を「1つの仕事」で満たそうとすると、ちょっと苦しい。", { x: 0.5, y: 4.6, w: 12.3, h: 0.7,
    align: "center", fontSize: 20, color: C.muted, fontFace: FONT });
  footer(s, N);
})();

// =====================================================================
// 14. 5要素の提示（答え合わせ）※維持
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "仕事に何を求めますか？？");
  s.addText("※よく挙がるのは、この5つ", { x: 0.5, y: 1.25, w: 12.3, h: 0.5, align: "center",
    fontSize: 18, color: C.muted, fontFace: FONT });
  const items = [
    { t: "給与", c: C.teal }, { t: "やりがい", c: C.orange }, { t: "成長", c: C.green2 },
    { t: "社会貢献", c: C.coral }, { t: "人間関係", c: C.purple },
  ];
  const cw = 2.15, gap = 0.3, totalW = items.length * cw + (items.length - 1) * gap;
  let cx = (13.333 - totalW) / 2;
  items.forEach(it => {
    s.addShape("roundRect", { x: cx, y: 2.9, w: cw, h: 1.6, rectRadius: 0.12,
      fill: { color: C.card }, line: { color: it.c, width: 1.75 } });
    s.addText(it.t, { x: cx, y: 2.9, w: cw, h: 1.6, align: "center", valign: "middle",
      fontSize: 24, bold: true, color: it.c, fontFace: FONT });
    cx += cw + gap;
  });
  footer(s, N);
})();

// =====================================================================
// 15. 全部満たせる仕事ある？※維持
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("全部満たせる仕事、\n見つかりますか？", { x: 0.5, y: 2.3, w: 12.3, h: 2.2, align: "center",
    fontSize: 46, bold: true, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.15 });
  footer(s, N);
})();

// =====================================================================
// 16. ムリだと思った ※維持
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText([
    { text: "”すっごく”ムリムリだ\n", options: { color: C.orange } },
    { text: "と思いました……", options: { color: C.white } },
  ], { x: 0.5, y: 2.4, w: 12.3, h: 2.0, align: "center",
    fontSize: 44, bold: true, fontFace: FONT, lineSpacingMultiple: 1.15 });
  footer(s, N);
})();

// =====================================================================
// 17. そこで ※維持
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("そこで", { x: 0.5, y: 3.0, w: 12.3, h: 1.4, align: "center",
    fontSize: 54, bold: true, color: C.teal, fontFace: FONT });
  footer(s, N);
})();

// =====================================================================
// 18. 集中のメリット・デメリット NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "「集中」のいいところ・しんどいところ", C.coral);
  s.addShape("roundRect", { x: 1.0, y: 1.7, w: 11.33, h: 1.7, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.green2, width: 1.25 } });
  s.addText([
    { text: "◎ いいところ\n", options: { fontSize: 18, bold: true, color: C.green2 } },
    { text: "・深く極められる／一点を突き抜けられる\n・「これが私」と言いやすい", options: { fontSize: 19, color: C.white } },
  ], { x: 1.4, y: 1.85, w: 10.5, h: 1.4, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.2 });
  s.addShape("roundRect", { x: 1.0, y: 3.6, w: 11.33, h: 1.7, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.coral, width: 1.25 } });
  s.addText([
    { text: "△ しんどいところ\n", options: { fontSize: 18, bold: true, color: C.coral } },
    { text: "・コケたとき、全部いっぺんに失う\n・視野がせまくなりがち", options: { fontSize: 19, color: C.white } },
  ], { x: 1.4, y: 3.75, w: 10.5, h: 1.4, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "じゃあ「分散」はどうだろう？");
  footer(s, N);
})();

// =====================================================================
// 19. 分散のメリット・デメリット NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "「分散」のいいところ・しんどいところ", C.teal);
  s.addShape("roundRect", { x: 1.0, y: 1.55, w: 11.33, h: 1.9, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.green2, width: 1.25 } });
  s.addText([
    { text: "◎ いいところ\n", options: { fontSize: 18, bold: true, color: C.green2 } },
    { text: "・リスクが分かれる（1つコケても平気）\n・違う活動どうしが「掛け算」になる\n・無理がないから、長く続けられる", options: { fontSize: 19, color: C.white } },
  ], { x: 1.4, y: 1.7, w: 10.5, h: 1.6, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.2 });
  s.addShape("roundRect", { x: 1.0, y: 3.6, w: 11.33, h: 1.5, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.coral, width: 1.25 } });
  s.addText([
    { text: "△ しんどいところ\n", options: { fontSize: 18, bold: true, color: C.coral } },
    { text: "・すぐには突き抜けない／時間がかかる", options: { fontSize: 19, color: C.white } },
  ], { x: 1.4, y: 3.75, w: 10.5, h: 1.2, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "高校生の今は「分散」が向いている、というのが今日の提案");
  footer(s, N);
})();

// =====================================================================
// 20. 分散フレーム（岡田斗司夫）
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("一つの仕事に「全部」を求めない ： 分散", { x: 0.4, y: 0.5, w: 12.5, h: 0.8,
    align: "center", fontSize: 30, bold: true, color: C.white, fontFace: FONT });
  s.addText("岡田斗司夫さんの考え方より", { x: 0.6, y: 1.3, w: 12, h: 0.4,
    fontSize: 14, color: C.muted, fontFace: FONT });
  const jobs = [
    { job: "仕事 A", val: "お金",     c: C.coral },
    { job: "仕事 B", val: "やりがい", c: C.teal },
    { job: "仕事 C", val: "人間関係", c: C.purple },
    { job: "仕事 D", val: "社会貢献", c: C.green2 },
    { job: "仕事 E", val: "成長",     c: C.orange },
  ];
  const cw = 2.3, gap = 0.18, totalW = jobs.length * cw + (jobs.length - 1) * gap;
  let cx = (13.333 - totalW) / 2;
  jobs.forEach(j => {
    s.addShape("roundRect", { x: cx, y: 2.4, w: cw, h: 0.7, rectRadius: 0.06, fill: { color: j.c } });
    s.addText(j.job, { x: cx, y: 2.4, w: cw, h: 0.7, align: "center", valign: "middle",
      fontSize: 18, bold: true, color: C.bg, fontFace: FONT });
    s.addShape("roundRect", { x: cx, y: 3.2, w: cw, h: 1.0, rectRadius: 0.06,
      fill: { color: C.card }, line: { color: j.c, width: 1 } });
    s.addText(j.val, { x: cx, y: 3.2, w: cw, h: 1.0, align: "center", valign: "middle",
      fontSize: 20, bold: true, color: j.c, fontFace: FONT });
    cx += cw + gap;
  });
  s.addText("お金はA、やりがいはB、人間関係はC……と「分けて」手に入れる", { x: 0.5, y: 4.7, w: 12.3, h: 0.7,
    align: "center", fontSize: 20, color: C.white, fontFace: FONT });
  hint(s, "これを自分に当てはめると……");
  footer(s, N);
})();

// =====================================================================
// 21. 私の場合 NEW（分離）
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "私の場合の「分散」");
  const rows = [
    { c: C.coral,  l: "Dell（本業）",        r: "お金" },
    { c: C.teal,   l: "まなびぱれっと",       r: "やりがい" },
    { c: C.orange, l: "カメラ / 同人誌・小説", r: "成長" },
    { c: C.purple, l: "コミケスタッフ",       r: "人間関係" },
  ];
  let y = 1.7;
  rows.forEach(b => {
    s.addShape("roundRect", { x: 1.5, y, w: 10.33, h: 0.9, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape("rect", { x: 1.5, y, w: 0.16, h: 0.9, fill: { color: b.c } });
    s.addText(b.l, { x: 1.9, y, w: 6.5, h: 0.9, valign: "middle",
      fontSize: 21, bold: true, color: C.white, fontFace: FONT });
    s.addText("→ " + b.r, { x: 8.5, y, w: 3.0, h: 0.9, valign: "middle",
      fontSize: 20, bold: true, color: b.c, fontFace: FONT });
    y += 1.02;
  });
  s.addShape("roundRect", { x: 1.5, y: 5.85, w: 10.33, h: 0.85, rectRadius: 0.08,
    fill: { color: C.cardLt }, line: { color: C.green2, width: 1.25 } });
  s.addText("一つの仕事が多少しんどくても、他のところでバランスが取れる", { x: 1.5, y: 5.85, w: 10.33, h: 0.85,
    align: "center", valign: "middle", fontSize: 18, bold: true, color: C.white, fontFace: FONT });
  footer(s, N);
})();

// =====================================================================
// 22. 分散の誤解（器用貧乏では？）→反論 NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addShape("roundRect", { x: 2.0, y: 0.9, w: 9.33, h: 0.9, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.coral, width: 1.5 } });
  s.addText("「分散って、ただの器用貧乏では？」", { x: 2.0, y: 0.9, w: 9.33, h: 0.9,
    align: "center", valign: "middle", fontSize: 24, bold: true, color: C.coral, fontFace: FONT });
  s.addText("——よく言われます。でも、こう考えています。", { x: 0.5, y: 2.0, w: 12.3, h: 0.5,
    align: "center", fontSize: 16, color: C.muted, fontFace: FONT });
  barList(s, [
    { c: C.teal,   main: "① 突き抜ける人も、最初は「いろいろ試す」から始まっている" },
    { c: C.purple, main: "② バラバラの経験は、つながると「自分だけの武器」になる" },
    { c: C.green2, main: "③ 続けられる人が、結局いちばん遠くまで行ける" },
  ], { y: 2.7, h: 1.05, gap: 0.25 });
  footer(s, N);
})();

// =====================================================================
// 23. 分散は「掛け算」になる NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "バラバラの「好き」は、ある日つながる", C.orange);
  s.addText("分散は、足し算じゃなくて掛け算になる", { x: 0.5, y: 1.2, w: 12.3, h: 0.5,
    align: "center", fontSize: 18, color: C.muted, fontFace: FONT });
  const eqs = [
    { a: "カメラ", b: "教育",       r: "教材・スクール撮影", c: C.teal },
    { a: "小説",   b: "ラジオ",     r: "番組の構成作家",     c: C.purple },
    { a: "企画",   b: "コミュニティ", r: "イベント運営",       c: C.green2 },
  ];
  let y = 1.95;
  eqs.forEach(e => {
    s.addShape("roundRect", { x: 1.2, y, w: 10.93, h: 1.25, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: e.c, width: 1.25 } });
    s.addText([
      { text: e.a, options: { fontSize: 22, bold: true, color: C.white } },
      { text: "　×　", options: { fontSize: 22, bold: true, color: e.c } },
      { text: e.b, options: { fontSize: 22, bold: true, color: C.white } },
      { text: "　＝　", options: { fontSize: 22, bold: true, color: e.c } },
      { text: e.r, options: { fontSize: 22, bold: true, color: e.c } },
    ], { x: 1.6, y, w: 10.2, h: 1.25, valign: "middle", align: "center", fontFace: FONT });
    y += 1.4;
  });
  hint(s, "なんでこの考えに至ったのか……");
  footer(s, N);
})();

// =====================================================================
// 24. とにかく失敗が多かった ※維持
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "とにかく失敗が多かった……", C.white);
  const items = [
    { n: "1", t: "インターン2社同時 → 電車に2社分のPCを忘れた", c: C.coral },
    { n: "2", t: "大学を留年した（学費は自分で払った……）",     c: C.orange },
    { n: "3", t: "仕事でも同じ構造のミスを繰り返した",           c: C.teal },
  ];
  let y = 1.75;
  items.forEach(it => {
    s.addShape("roundRect", { x: 1.2, y, w: 10.93, h: 1.1, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape("ellipse", { x: 1.45, y: y + 0.28, w: 0.55, h: 0.55, fill: { color: it.c } });
    s.addText(it.n, { x: 1.45, y: y + 0.28, w: 0.55, h: 0.55, align: "center", valign: "middle",
      fontSize: 22, bold: true, color: C.bg, fontFace: FONT });
    s.addText(it.t, { x: 2.25, y, w: 9.7, h: 1.1, valign: "middle",
      fontSize: 21, bold: true, color: C.white, fontFace: FONT });
    y += 1.3;
  });
  hint(s, "中でも忘れられないのが……");
  footer(s, N);
})();

// =====================================================================
// 25. 失敗深掘り①PC NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("失敗エピソード ①", { x: 0.6, y: 0.4, w: 12, h: 0.6, fontSize: 18, color: C.coral, fontFace: FONT });
  s.addText("インターンを2社、同時にやった結果……", { x: 0.5, y: 1.1, w: 12.3, h: 0.9,
    align: "center", fontSize: 30, bold: true, color: C.white, fontFace: FONT });
  s.addShape("roundRect", { x: 1.5, y: 2.4, w: 10.33, h: 2.6, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.coral, width: 1.25 } });
  s.addText([
    { text: "電車に、2社分のノートPCを忘れた\n\n", options: { fontSize: 26, bold: true, color: C.coral } },
    { text: "頭が真っ白。会社にも平謝り。\n「両立」って、見た目以上に難しい。", options: { fontSize: 20, color: C.white } },
  ], { x: 1.9, y: 2.6, w: 9.5, h: 2.2, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "※どうやって取り返したかは、Q&Aで");
  footer(s, N);
})();

// =====================================================================
// 26. 失敗深掘り②留年 NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("失敗エピソード ②", { x: 0.6, y: 0.4, w: 12, h: 0.6, fontSize: 18, color: C.orange, fontFace: FONT });
  s.addText("大学を、留年した", { x: 0.5, y: 1.1, w: 12.3, h: 0.9,
    align: "center", fontSize: 34, bold: true, color: C.white, fontFace: FONT });
  s.addShape("roundRect", { x: 1.5, y: 2.4, w: 10.33, h: 2.6, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.orange, width: 1.25 } });
  s.addText([
    { text: "色々やりすぎて、単位を落とした。\n学費は、自分で払った。\n\n", options: { fontSize: 22, color: C.white } },
    { text: "正直しんどかった。でも——「終わり」ではなかった。", options: { fontSize: 22, bold: true, color: C.orange } },
  ], { x: 1.9, y: 2.6, w: 9.5, h: 2.2, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.2 });
  footer(s, N);
})();

// =====================================================================
// 27. でも、折れなかった（分散の効用）NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("でも、折れなかった", { x: 0.5, y: 1.5, w: 12.3, h: 1.0, align: "center",
    fontSize: 42, bold: true, color: C.teal, fontFace: FONT });
  s.addShape("roundRect", { x: 1.5, y: 2.9, w: 10.33, h: 2.3, rectRadius: 0.1,
    fill: { color: C.cardLt }, line: { color: C.teal, width: 1.5 } });
  s.addText([
    { text: "一つコケても、他の活動が残っていたから。\n", options: { fontSize: 24, bold: true, color: C.white } },
    { text: "\n「分散」は、心を守るセーフティネットにもなる。", options: { fontSize: 22, bold: true, color: C.teal } },
  ], { x: 1.9, y: 3.1, w: 9.5, h: 1.9, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "だから、進路の話に戻ります");
  footer(s, N);
})();

// =====================================================================
// 28. 内部進学への一言（レール肯定+上乗せ）
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "明治に上がる人へ", C.orange);
  s.addShape("roundRect", { x: 1.2, y: 1.6, w: 10.93, h: 1.5, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.green2, width: 1.5 } });
  s.addText([
    { text: "内部進学は、立派な選択。\n", options: { fontSize: 24, bold: true, color: C.green2 } },
    { text: "「分散しよう」は、レールを否定する話じゃない。", options: { fontSize: 20, color: C.white } },
  ], { x: 1.6, y: 1.75, w: 10.1, h: 1.2, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.15 });
  s.addShape("roundRect", { x: 1.2, y: 3.35, w: 10.93, h: 2.3, rectRadius: 0.1,
    fill: { color: C.cardLt }, line: { color: C.orange, width: 1.75 } });
  s.addText([
    { text: "その上で——\n", options: { fontSize: 20, color: C.muted } },
    { text: "「大学の4年間で “何を” 分散させるか」\n", options: { fontSize: 28, bold: true, color: C.white } },
    { text: "を、今から考えておくと、めちゃくちゃ強い。", options: { fontSize: 22, bold: true, color: C.orange } },
  ], { x: 1.6, y: 3.55, w: 10.1, h: 1.9, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "じゃあ、何を分散させる？");
  footer(s, N);
})();

// =====================================================================
// 29. 大学の4年間で何を分散させる？ NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "大学の4年間で、分散できること");
  const grid = [
    { emoji: "📚", head: "学問・研究",     items: ["専攻＋他学部の授業"], c: C.teal },
    { emoji: "🎭", head: "サークル・部活", items: ["好きを深める仲間"],   c: C.purple },
    { emoji: "💼", head: "長期インターン", items: ["社会を先に味見"],     c: C.orange },
    { emoji: "✈", head: "留学・旅",       items: ["世界を広げる"],       c: C.blue },
    { emoji: "🚀", head: "副業・起業",     items: ["小さく自分で稼ぐ"],   c: C.coral },
    { emoji: "🤝", head: "コミュニティ",   items: ["学外の居場所"],       c: C.green2 },
  ];
  const cw = 3.95, ch = 1.6, gx = 0.55, gy = 0.3, x0 = 0.55, y0 = 1.55;
  grid.forEach((g, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = x0 + col * (cw + gx), y = y0 + row * (ch + gy);
    s.addShape("roundRect", { x, y, w: cw, h: ch, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: g.c, width: 1.25 } });
    s.addText([
      { text: g.emoji + " ", options: { fontSize: 17 } },
      { text: g.head, options: { fontSize: 17, bold: true, color: g.c } },
    ], { x: x + 0.2, y: y + 0.15, w: cw - 0.4, h: 0.5, fontFace: FONT });
    s.addText(g.items.join("\n"), { x: x + 0.25, y: y + 0.75, w: cw - 0.45, h: ch - 0.85,
      fontSize: 14, color: C.sub, fontFace: FONT, valign: "top" });
  });
  hint(s, "全部やらなくていい。種を「複数」まいておくだけ");
  footer(s, N);
})();

// =====================================================================
// 30. 進路を「分散」しませんか（高1向け）
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("そこで提案します！", { x: 0.6, y: 0.35, w: 12, h: 0.5, fontSize: 18, color: C.muted, fontFace: FONT });
  s.addText("進路を「分散」しませんか", { x: 0.4, y: 0.85, w: 12.5, h: 1.0, align: "center",
    fontSize: 44, bold: true, color: C.white, fontFace: FONT });
  barList(s, [
    { c: C.teal,   main: "「好き」は、複数持っておいていい", sub: "一つに絞らなくていい。今のうちに増やしておく" },
    { c: C.purple, main: "没頭できる物語は無数にある",       sub: "——燃え尽きるほど一点に賭けなくていい" },
    { c: C.white,  main: "これからの3年間・大学の4年間をどう使うか", sub: "進路は“いつ決めるか”より“どう分散させておくか”" },
  ], { y: 2.15, h: 1.25, gap: 0.15 });
  hint(s, "【よくある不安】分散したら失敗してしまうかも……");
  footer(s, N);
})();

// =====================================================================
// 31. 進路に「失敗」はない ※維持（強い）
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("(たくさん失敗した植元が言う)", { x: 0.5, y: 0.4, w: 12.3, h: 0.5, align: "center",
    fontSize: 16, color: C.muted, fontFace: FONT });
  s.addText("進路に「失敗」はない", { x: 0.4, y: 0.85, w: 12.5, h: 0.9, align: "center",
    fontSize: 36, bold: true, color: C.orange, fontFace: FONT });
  s.addShape("roundRect", { x: 1.0, y: 2.0, w: 11.33, h: 3.6, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.border, width: 1 } });
  s.addText("大学でも大学院でも専門でも就職でも、内部進学でも、", { x: 1.4, y: 2.3, w: 10.5, h: 0.6,
    fontSize: 20, color: C.white, fontFace: FONT });
  s.addText("「なぜその選択をしたか」", { x: 1.0, y: 3.0, w: 11.33, h: 1.2, align: "center",
    fontSize: 42, bold: true, color: C.orange, fontFace: FONT });
  s.addText("を言えれば問題ない！", { x: 1.0, y: 4.35, w: 11.33, h: 0.8, align: "right",
    fontSize: 28, bold: true, color: C.white, fontFace: FONT });
  s.addText("失敗も、色々も、普通じゃないルートも —— 理由があれば「自分の進路」", { x: 0.5, y: 6.0, w: 12.3, h: 0.5,
    align: "center", fontSize: 16, color: C.muted, fontFace: FONT });
  footer(s, N);
})();

// =====================================================================
// 32. 高校3年間でできる分散（今日からの一歩）NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "高校の3年間で、今日からできること", C.teal);
  barList(s, [
    { c: C.teal,   main: "1. 好きなことを「3つ」書き出してみる" },
    { c: C.orange, main: "2. やったことないことを「1つ」試してみる" },
    { c: C.purple, main: "3. 部活・教室の外の場所に、顔を出してみる" },
    { c: C.green2, main: "4. 小さく発信する（SNS・文章・動画なんでも）" },
  ], { y: 1.75, h: 1.05, gap: 0.22 });
  hint(s, "大きく変えなくていい。種を増やすだけ");
  footer(s, N);
})();

// =====================================================================
// 33. 今日の持ち帰り（まとめ3点）NEW
// =====================================================================
(() => {
  const s = newSlide(); N++;
  title(s, "今日の持ち帰り", C.orange);
  const items = [
    { n: "1", c: C.teal,   t: "進路も「好き」も、複数あっていい" },
    { n: "2", c: C.purple, t: "明治に上がるなら、大学4年で“何を分散させるか”を今から" },
    { n: "3", c: C.orange, t: "進路に「失敗」はない（理由を言えれば自分の進路）" },
  ];
  let y = 1.75;
  items.forEach(it => {
    s.addShape("roundRect", { x: 1.2, y, w: 10.93, h: 1.25, rectRadius: 0.1,
      fill: { color: C.card }, line: { color: it.c, width: 1.5 } });
    s.addShape("ellipse", { x: 1.5, y: y + 0.32, w: 0.6, h: 0.6, fill: { color: it.c } });
    s.addText(it.n, { x: 1.5, y: y + 0.32, w: 0.6, h: 0.6, align: "center", valign: "middle",
      fontSize: 24, bold: true, color: C.bg, fontFace: FONT });
    s.addText(it.t, { x: 2.35, y, w: 9.6, h: 1.25, valign: "middle",
      fontSize: 20, bold: true, color: C.white, fontFace: FONT });
    y += 1.45;
  });
  footer(s, N);
})();

// =====================================================================
// 34. Q & A（高1×内部進学トピック）
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("なんでも聞いてください", { x: 0.7, y: 0.4, w: 12, h: 0.8,
    fontSize: 30, bold: true, color: C.white, fontFace: FONT });
  s.addText("Q & A", { x: 0.7, y: 1.2, w: 12, h: 1.4,
    fontSize: 64, bold: true, color: C.orange, fontFace: FONT });
  const topics = [
    "内部進学（明治）ってどう？", "大学の4年間、どう使う？", "「好き」の増やし方",
    "副業・フリーランスの話", "お金・給料のこと", "失敗談のつづき",
  ];
  const cw = 3.85, ch = 0.95, gx = 0.2, gy = 0.25, x0 = 0.7, y0 = 3.0;
  topics.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = x0 + col * (cw + gx), y = y0 + row * (ch + gy);
    s.addShape("roundRect", { x, y, w: cw, h: ch, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addText(t, { x: x + 0.15, y, w: cw - 0.3, h: ch, align: "center", valign: "middle",
      fontSize: 17, color: C.sub, fontFace: FONT });
  });
  s.addText("Q&Aは10分ほど取ります", { x: 0.7, y: 6.4, w: 12, h: 0.5,
    fontSize: 16, color: C.muted, italic: true, fontFace: FONT });
  footer(s, N);
})();

// =====================================================================
// 35. 質問がなければ……（沈黙対策）
// =====================================================================
(() => {
  const s = newSlide(); N++;
  s.addText("質問がなければ……", { x: 0.7, y: 0.35, w: 12, h: 0.8,
    fontSize: 28, bold: true, color: C.muted, fontFace: FONT });
  const qs = [
    { c: C.coral,  t: "留年したとき、親になんて言った？" },
    { c: C.teal,   t: "サンリオのバイト、実際どうだった？" },
    { c: C.orange, t: "インターンのPC、どうやって取り返した？" },
    { c: C.purple, t: "今の仕事、ぶっちゃけ給料いくら？" },
    { c: C.green2, t: "高校の3年間、何に時間を使うか決めてる？" },
  ];
  let y = 1.35;
  qs.forEach(q => {
    s.addShape("roundRect", { x: 1.0, y, w: 11.33, h: 0.92, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape("rect", { x: 1.0, y, w: 0.14, h: 0.92, fill: { color: q.c } });
    s.addText(q.t, { x: 1.4, y, w: 10.8, h: 0.92, valign: "middle",
      fontSize: 21, bold: true, color: C.white, fontFace: FONT });
    y += 1.07;
  });
  footer(s, N);
})();

if (N !== TOTAL) console.warn(`⚠ slide count ${N} != TOTAL ${TOTAL}`);
pptx.writeFile({ fileName: "build/career_talk_setagaya.pptx" }).then(f => {
  console.log("✅ wrote", f, "/ slides:", N);
});

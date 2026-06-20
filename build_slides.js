// 進路も分散してみませんか — 明治大学附属世田谷高校 高1 / 50分 版
// v6（明聖・高3・20分）をベースに世田谷向けに調整
// 生成: node build_slides.js  ->  build/career_talk_setagaya.pptx
const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "W16x9", width: 13.333, height: 7.5 });
pptx.layout = "W16x9";
pptx.author = "植元 雅斗";
pptx.title = "進路も分散してみませんか";

// ---- パレット（v6踏襲） ----
const C = {
  bg:     "14223A", // 背景ネイビー（v6の中間色）
  card:   "1B2942", // カード面
  cardLt: "22324F", // 明るめカード
  border: "33455F",
  white:  "FFFFFF",
  muted:  "8294AE", // ヒント/補足
  sub:    "AEBED4",
  teal:   "2EC4B6",
  orange: "F4A261",
  coral:  "E76F51",
  green:  "2A9D8F",
  green2: "52B788",
  purple: "9B7BFF",
  blue:   "5C9DE0",
};
const FONT = "IPAGothic";
const TOTAL = 17;

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

// =====================================================================
// 1. 集中と分散：働き方の考え方
// =====================================================================
(() => {
  const s = newSlide();
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
  footer(s, 1);
})();

// =====================================================================
// 2. 進路も分散してみませんか + 活動グリッド（6分類）※タイトル維持
// =====================================================================
(() => {
  const s = newSlide();
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
  footer(s, 2);
})();

// =====================================================================
// 3. 人生目標 3層構造 ※維持
// =====================================================================
(() => {
  const s = newSlide();
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
  hint(s, "どんなバイトをしてきたの？");
  footer(s, 3);
})();

// =====================================================================
// 4. 学生時代のバイト/仕事歴（写真4枚）※維持・沈黙対策の伏線
// =====================================================================
(() => {
  const s = newSlide();
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
  footer(s, 4);
})();

// =====================================================================
// 5. 仕事に何を求めますか？？（問い）※維持
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("仕事に何を求めますか？？", { x: 0.5, y: 2.6, w: 12.3, h: 1.4, align: "center",
    fontSize: 46, bold: true, color: C.white, fontFace: FONT });
  s.addText("※複数OKです", { x: 0.5, y: 4.1, w: 12.3, h: 0.6, align: "center",
    fontSize: 20, color: C.muted, fontFace: FONT });
  footer(s, 5);
})();

// =====================================================================
// 6. ★NEW ワーク① まず書いてみよう（2分）
// =====================================================================
(() => {
  const s = newSlide();
  s.addShape("roundRect", { x: 4.4, y: 0.45, w: 4.5, h: 0.7, rectRadius: 0.35,
    fill: { color: C.orange } });
  s.addText("WORK ①  まず書いてみよう", { x: 4.4, y: 0.45, w: 4.5, h: 0.7, align: "center",
    fontSize: 20, bold: true, color: C.bg, fontFace: FONT });
  s.addText("仕事に求めるもの、ぜんぶ書き出してみよう", { x: 0.5, y: 1.4, w: 12.3, h: 0.8,
    align: "center", fontSize: 28, bold: true, color: C.white, fontFace: FONT });

  const chips = [
    { t: "給与",     c: C.teal },
    { t: "やりがい", c: C.orange },
    { t: "成長",     c: C.green2 },
    { t: "社会貢献", c: C.coral },
    { t: "人間関係", c: C.purple },
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
  footer(s, 6);
})();

// =====================================================================
// 7. ★NEW ワーク② 発表・全体で見てみよう
// =====================================================================
(() => {
  const s = newSlide();
  s.addShape("roundRect", { x: 4.4, y: 0.45, w: 4.5, h: 0.7, rectRadius: 0.35,
    fill: { color: C.teal } });
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
  footer(s, 7);
})();

// =====================================================================
// 8. 5要素の提示（答え合わせ）※v6維持
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "仕事に何を求めますか？？");
  s.addText("※複数OKです", { x: 0.5, y: 1.25, w: 12.3, h: 0.5, align: "center",
    fontSize: 18, color: C.muted, fontFace: FONT });
  const items = [
    { t: "給与",     c: C.teal },
    { t: "やりがい", c: C.orange },
    { t: "成長",     c: C.green2 },
    { t: "社会貢献", c: C.coral },
    { t: "人間関係", c: C.purple },
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
  footer(s, 8);
})();

// =====================================================================
// 9. 全部満たせる仕事見つかりますか？※維持
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("全部満たせる仕事、\n見つかりますか？", { x: 0.5, y: 2.3, w: 12.3, h: 2.2, align: "center",
    fontSize: 46, bold: true, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.15 });
  footer(s, 9);
})();

// =====================================================================
// 10. "すっごく"ムリムリだと思いました ※維持
// =====================================================================
(() => {
  const s = newSlide();
  s.addText([
    { text: "”すっごく”ムリムリだ\n", options: { color: C.orange } },
    { text: "と思いました……", options: { color: C.white } },
  ], { x: 0.5, y: 2.4, w: 12.3, h: 2.0, align: "center",
    fontSize: 44, bold: true, fontFace: FONT, lineSpacingMultiple: 1.15 });
  footer(s, 10);
})();

// =====================================================================
// 11. そこで（トランジション）※維持
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("そこで", { x: 0.5, y: 3.0, w: 12.3, h: 1.4, align: "center",
    fontSize: 54, bold: true, color: C.teal, fontFace: FONT });
  footer(s, 11);
})();

// =====================================================================
// 12. 岡田斗司夫 分散フレーム（+内部進学向け一文）
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("一つの仕事に「全部」を求めない ： 分散", { x: 0.4, y: 0.3, w: 12.5, h: 0.8,
    align: "center", fontSize: 30, bold: true, color: C.white, fontFace: FONT });
  s.addText("岡田斗司夫さんの考え方より", { x: 0.6, y: 1.1, w: 12, h: 0.4,
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
    s.addShape("roundRect", { x: cx, y: 1.65, w: cw, h: 0.55, rectRadius: 0.06, fill: { color: j.c } });
    s.addText(j.job, { x: cx, y: 1.65, w: cw, h: 0.55, align: "center", valign: "middle",
      fontSize: 16, bold: true, color: C.bg, fontFace: FONT });
    s.addShape("roundRect", { x: cx, y: 2.28, w: cw, h: 0.75, rectRadius: 0.06,
      fill: { color: C.card }, line: { color: j.c, width: 1 } });
    s.addText(j.val, { x: cx, y: 2.28, w: cw, h: 0.75, align: "center", valign: "middle",
      fontSize: 18, bold: true, color: j.c, fontFace: FONT });
    cx += cw + gap;
  });

  // 私の場合
  s.addShape("roundRect", { x: 0.7, y: 3.35, w: 11.93, h: 1.55, rectRadius: 0.08,
    fill: { color: C.cardLt }, line: { color: C.border, width: 1 } });
  s.addText("私の場合", { x: 0.95, y: 3.45, w: 11.4, h: 0.4, fontSize: 15, color: C.muted, fontFace: FONT });
  s.addText([
    { text: "Dell（お金） ＋ まなびぱれっと（やりがい）\n", options: { fontSize: 19, bold: true, color: C.white } },
    { text: "＋ カメラ（成長） ＋ 同人誌・小説（成長） ＋ コミケスタッフ（人間関係）", options: { fontSize: 19, bold: true, color: C.white } },
  ], { x: 0.95, y: 3.85, w: 11.4, h: 0.95, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.1 });

  // ★内部進学層向けの一文
  s.addShape("roundRect", { x: 0.7, y: 5.05, w: 11.93, h: 1.35, rectRadius: 0.08,
    fill: { color: C.card }, line: { color: C.orange, width: 1.5 } });
  s.addText([
    { text: "明治に上がるのも、立派な選択。", options: { fontSize: 18, bold: true, color: C.orange } },
    { text: "  レールを否定する話じゃない。\n", options: { fontSize: 18, color: C.sub } },
    { text: "その上で「大学の4年間で“何を”分散させるか」を、今から考えておくと強い。", options: { fontSize: 18, bold: true, color: C.white } },
  ], { x: 1.0, y: 5.15, w: 11.3, h: 1.15, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.15 });

  hint(s, "なんでこの考えに至ったのか……");
  footer(s, 12);
})();

// =====================================================================
// 13. とにかく失敗が多かった ※維持
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "とにかく失敗が多かった……", C.white);
  const items = [
    { n: "1", t: "インターン2社同時 → 電車に2社分のPCを忘れた", c: C.coral },
    { n: "2", t: "大学を留年した（学費を自分で払ったけれども……）", c: C.orange },
    { n: "3", t: "仕事でも同じ構造のミスを繰り返した", c: C.teal },
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
  hint(s, "だから一つの仕事に集中するのはリスクかも……");
  footer(s, 13);
})();

// =====================================================================
// 14. 進路を「分散」しませんか（高1向け角度）
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("そこで提案します！", { x: 0.6, y: 0.35, w: 12, h: 0.5, fontSize: 18, color: C.muted, fontFace: FONT });
  s.addText("進路を「分散」しませんか", { x: 0.4, y: 0.85, w: 12.5, h: 1.0, align: "center",
    fontSize: 44, bold: true, color: C.white, fontFace: FONT });

  const lines = [
    { c: C.teal,   main: "「好き」は、複数持っておいていい", sub: "一つに絞らなくていい。今のうちに増やしておく" },
    { c: C.purple, main: "没頭できる物語は無数にある",       sub: "——燃え尽きるほど一点に賭けなくていい" },
    { c: C.white,  main: "これからの3年間・大学の4年間をどう使うか", sub: "進路は“いつ決めるか”より“どう分散させておくか”" },
  ];
  let y = 2.15;
  lines.forEach(l => {
    s.addShape("roundRect", { x: 1.0, y, w: 11.33, h: 1.25, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 1 } });
    s.addShape("rect", { x: 1.0, y, w: 0.16, h: 1.25, fill: { color: l.c } });
    s.addText(l.main, { x: 1.4, y: y + 0.15, w: 10.7, h: 0.6, valign: "middle",
      fontSize: 23, bold: true, color: l.c === C.white ? C.white : l.c, fontFace: FONT });
    s.addText(l.sub, { x: 1.4, y: y + 0.72, w: 10.7, h: 0.4, valign: "middle",
      fontSize: 15, color: C.muted, fontFace: FONT });
    y += 1.4;
  });
  hint(s, "【よくある不安】分散したら失敗してしまうかも……");
  footer(s, 14);
})();

// =====================================================================
// 15. 進路に「失敗」はない ※維持（強い）
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("(たくさん失敗した植元が言う)", { x: 0.5, y: 0.4, w: 12.3, h: 0.5, align: "center",
    fontSize: 16, color: C.muted, fontFace: FONT });
  s.addText("進路に「失敗」はない", { x: 0.4, y: 0.85, w: 12.5, h: 0.9, align: "center",
    fontSize: 36, bold: true, color: C.orange, fontFace: FONT });

  s.addShape("roundRect", { x: 1.0, y: 2.0, w: 11.33, h: 3.6, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.border, width: 1 } });
  s.addText("大学でも大学院でも専門でも就職でも修行でも、", { x: 1.4, y: 2.3, w: 10.5, h: 0.6,
    fontSize: 20, color: C.white, fontFace: FONT });
  s.addText("「なぜその選択をしたか」", { x: 1.0, y: 3.0, w: 11.33, h: 1.2, align: "center",
    fontSize: 42, bold: true, color: C.orange, fontFace: FONT });
  s.addText("を言えれば問題ない！", { x: 1.0, y: 4.35, w: 11.33, h: 0.8, align: "right",
    fontSize: 28, bold: true, color: C.white, fontFace: FONT });

  s.addText("失敗も、色々も、普通じゃないルートも —— 理由があれば「自分の進路」", { x: 0.5, y: 6.0, w: 12.3, h: 0.5,
    align: "center", fontSize: 16, color: C.muted, fontFace: FONT });
  hint(s, "だから提案します……");
  footer(s, 15);
})();

// =====================================================================
// 16. Q&A（高1×内部進学トピックに更新）
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("なんでも聞いてください", { x: 0.7, y: 0.4, w: 12, h: 0.8,
    fontSize: 30, bold: true, color: C.white, fontFace: FONT });
  s.addText("Q & A", { x: 0.7, y: 1.2, w: 12, h: 1.4,
    fontSize: 64, bold: true, color: C.orange, fontFace: FONT });

  const topics = [
    "内部進学（明治）ってどう？",
    "大学の4年間、どう使う？",
    "「好き」の増やし方",
    "副業・フリーランスの話",
    "お金・給料のこと",
    "失敗談のつづき",
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
  s.addText("Q&Aは10〜15分くらい取ります", { x: 0.7, y: 6.4, w: 12, h: 0.5,
    fontSize: 16, color: C.muted, italic: true, fontFace: FONT });
  footer(s, 16);
})();

// =====================================================================
// 17. 質問がなければ……（沈黙対策・高1調整）
// =====================================================================
(() => {
  const s = newSlide();
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
  footer(s, 17);
})();

pptx.writeFile({ fileName: "build/career_talk_setagaya.pptx" }).then(f => {
  console.log("✅ wrote", f);
});

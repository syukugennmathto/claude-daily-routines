// 進路も分散してみませんか — 明治大学附属世田谷高校 高1 / 50分版（53枚・2本柱＋職業観版）
// v6（明聖・高3・20分）ベース。世田谷向け調整＋「場づくり」の柱＋Dell/IT職業観を追加。
// 柱① 分散 / 柱② 場をつくる の2本柱。締め: 分散→場づくり→失敗はない→人生目標。
// 学校リクエスト対応: (1)Dellの仕事内容/必要スキル/向いている人材 (2)IT志望クラス向けに数学×IT×暗号
//                     (3)プロジェクター視認性=フォント大・線太・高コントラスト配色
// 生成: node build_slides.js  ->  build/career_talk_setagaya.pptx
const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "W16x9", width: 13.333, height: 7.5 });
pptx.layout = "W16x9";
pptx.author = "植元 雅斗";
pptx.title = "進路も分散してみませんか";

// ---- パレット（プロジェクター視認性を上げた高コントラスト版） ----
// 濃紺背景に対し、二次テキスト(muted/sub)と青系を明るくして「薄い青文字」問題を解消。
const C = {
  bg:     "14223A", card:   "1B2942", cardLt: "22324F", border: "44597A",
  white:  "FFFFFF", muted:  "B4C2D6", sub:    "CFDAE8",
  teal:   "3AD6C6", orange: "F6B071", coral:  "F0866B",
  green:  "3BBBA6", green2: "63C79A", purple: "B39BFF", blue:   "7FB6EC",
};
const FONT = "IPAGothic";
const TOTAL = 53;
let N = 0;

function bg(s) { s.background = { color: C.bg }; }
function footer(s) {
  s.addText(`${N}/${TOTAL}`, { x: 11.9, y: 6.95, w: 1.3, h: 0.4, align: "right",
    fontSize: 16, bold: true, color: C.muted, fontFace: FONT });
}
function hint(s, t) {
  s.addText(t, { x: 0.5, y: 6.8, w: 11.2, h: 0.55, align: "center",
    fontSize: 18, bold: true, color: C.muted, italic: true, fontFace: FONT });
}
function title(s, t, color = C.white) {
  s.addText(t, { x: 0.4, y: 0.33, w: 12.5, h: 0.98, align: "center",
    fontSize: 36, bold: true, color, fontFace: FONT });
}
function newSlide() { const s = pptx.addSlide(); bg(s); N++; return s; }

function barList(s, rows, opt = {}) {
  const x = opt.x ?? 1.0, w = opt.w ?? 11.33, h = opt.h ?? 1.0, gap = opt.gap ?? 0.22;
  let y = opt.y ?? 1.7;
  rows.forEach(r => {
    s.addShape("roundRect", { x, y, w, h, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 2 } });
    s.addShape("rect", { x, y, w: 0.22, h, fill: { color: r.c } });
    if (r.sub) {
      s.addText(r.main, { x: x + 0.4, y: y + 0.08, w: w - 0.7, h: h * 0.56, valign: "middle",
        fontSize: opt.fs ?? 24, bold: true, color: C.white, fontFace: FONT });
      s.addText(r.sub, { x: x + 0.4, y: y + h * 0.56, w: w - 0.7, h: h * 0.4, valign: "middle",
        fontSize: 16, bold: true, color: C.muted, fontFace: FONT });
    } else {
      s.addText(r.main, { x: x + 0.4, y, w: w - 0.7, h, valign: "middle",
        fontSize: opt.fs ?? 24, bold: true, color: C.white, fontFace: FONT });
    }
    y += h + gap;
  });
}

// 章扉
function chapter(kicker, num, big, sub, accent) {
  const s = newSlide();
  s.addShape("rect", { x: 0, y: 0, w: 0.5, h: 7.5, fill: { color: accent } });
  s.addText(kicker, { x: 1.2, y: 2.15, w: 11, h: 0.6, fontSize: 24, bold: true, color: C.muted, fontFace: FONT });
  s.addText([
    { text: num + "  ", options: { fontSize: 66, bold: true, color: accent } },
    { text: big, options: { fontSize: 66, bold: true, color: C.white } },
  ], { x: 1.2, y: 2.8, w: 11, h: 1.6, fontFace: FONT });
  s.addText(sub, { x: 1.25, y: 4.55, w: 11, h: 0.7, fontSize: 27, bold: true, color: accent, fontFace: FONT });
  footer(s);
}

// =====================================================================
// 1. 表紙
// =====================================================================
(() => {
  const s = newSlide();
  s.addShape("rect", { x: 0, y: 3.45, w: 13.333, h: 0.05, fill: { color: C.teal } });
  s.addText("進路も分散してみませんか", { x: 0.5, y: 2.1, w: 12.3, h: 1.2, align: "center",
    fontSize: 50, bold: true, color: C.white, fontFace: FONT });
  s.addText("〜 好きも、進路も、複数あっていい 〜", { x: 0.5, y: 3.55, w: 12.3, h: 0.7,
    align: "center", fontSize: 22, color: C.teal, fontFace: FONT });
  s.addText("植元 雅斗", { x: 0.5, y: 4.6, w: 12.3, h: 0.6, align: "center",
    fontSize: 24, bold: true, color: C.white, fontFace: FONT });
  s.addText("明治大学附属世田谷高校 / 2026.7.9", { x: 0.5, y: 5.3, w: 12.3, h: 0.5,
    align: "center", fontSize: 16, color: C.muted, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 2. 今日のゴール
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "今日のゴール");
  s.addShape("roundRect", { x: 1.8, y: 2.1, w: 9.73, h: 3.0, rectRadius: 0.12,
    fill: { color: C.cardLt }, line: { color: C.orange, width: 2.75 } });
  s.addText("持ち帰ってほしいのは、たった2つ", { x: 1.8, y: 2.45, w: 9.73, h: 0.7,
    align: "center", fontSize: 22, color: C.muted, fontFace: FONT });
  s.addText("「分散しよう」と「つくる側に回ろう」", { x: 1.8, y: 3.25, w: 9.73, h: 1.1,
    align: "center", fontSize: 30, bold: true, color: C.white, fontFace: FONT });
  s.addText("全部は覚えなくてOK。この2つだけ。", { x: 1.8, y: 4.35, w: 9.73, h: 0.6,
    align: "center", fontSize: 18, color: C.orange, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 3. 今日の流れ
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "今日の流れ");
  barList(s, [
    { c: C.teal,   main: "① 自己紹介 — ちょっと変わった大人の話", sub: "本業のかたわら、色々やっています" },
    { c: C.orange, main: "② ワーク — 仕事に何を求める？",         sub: "書いて、何人かに聞きます" },
    { c: C.purple, main: "③ 2つの柱 — 「分散」と「場をつくる」",   sub: "今日のメインの話" },
    { c: C.green2, main: "④ 進路の話 ＆ Q&A",                      sub: "最後はなんでも聞いてください" },
  ], { y: 1.75, h: 1.05, gap: 0.2 });
  footer(s);
})();

// =====================================================================
// 4. アイスブレイク
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("将来やりたいこと、\nもう決まってる人？", { x: 0.5, y: 1.9, w: 12.3, h: 2.0,
    align: "center", fontSize: 42, bold: true, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.15 });
  s.addText("決まってなくて全然OK。\n今日はむしろ「今は決めなくていい」という話をします。",
    { x: 0.5, y: 4.4, w: 12.3, h: 1.2, align: "center",
      fontSize: 20, color: C.teal, fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "（手を挙げてもらう／その場で2〜3人に聞く）");
  footer(s);
})();

// =====================================================================
// 5. 集中と分散：働き方の考え方
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
      fill: { color: C.card }, line: { color: c.accent, width: 2.5 } });
    s.addText(c.head, { x: c.x, y: 1.85, w: 5.3, h: 0.6, align: "center",
      fontSize: 24, bold: true, color: c.accent, fontFace: FONT });
    s.addText(c.emoji, { x: c.x, y: 2.5, w: 5.3, h: 1.0, align: "center", fontSize: 44, fontFace: FONT });
    s.addText(c.big, { x: c.x + 0.3, y: 3.6, w: 4.7, h: 1.3, align: "center",
      fontSize: 23, bold: true, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.1 });
    s.addText(c.sub, { x: c.x + 0.3, y: 5.1, w: 4.7, h: 0.7, align: "center",
      fontSize: 16, color: C.muted, fontFace: FONT });
  });
  hint(s, "※岡田斗司夫さんの「分散の考え方」を参考に……");
  footer(s);
})();

// =====================================================================
// 6. 活動グリッド（6分類）※維持
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
    { emoji: "💻", accent: C.teal,   head: "本業・正社員",     items: ["Dell（エンタープライズIT）"] },
    { emoji: "🔢", accent: C.purple, head: "数学・IT",         items: ["数学YouTube・アプリ開発", "ポスト量子暗号の実装"] },
    { emoji: "🏫", accent: C.coral,  head: "教育・ベンチャー", items: ["まなびぱれっと", "元SAPIX/家庭教師"] },
    { emoji: "📝", accent: C.green,  head: "執筆・メディア",   items: ["小説・同人誌（暗号解説）", "ラジオの構成作家"] },
    { emoji: "🏛", accent: C.blue,   head: "コミュニティ",     items: ["コミケスタッフ"] },
    { emoji: "📷", accent: C.green2, head: "クリエイティブ",   items: ["フリーランスカメラマン", "ボカロDJ"] },
  ];
  const cw = 3.95, ch = 1.95, gx = 0.55, gy = 0.25, x0 = 0.55, y0 = 1.75;
  grid.forEach((g, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = x0 + col * (cw + gx), y = y0 + row * (ch + gy);
    s.addShape("roundRect", { x, y, w: cw, h: ch, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: g.accent, width: 2.25 } });
    s.addText([
      { text: g.emoji + " ", options: { fontSize: 16 } },
      { text: g.head, options: { fontSize: 16, bold: true, color: g.accent } },
    ], { x: x + 0.2, y: y + 0.12, w: cw - 0.4, h: 0.5, fontFace: FONT });
    s.addText(g.items.join("\n"), { x: x + 0.25, y: y + 0.7, w: cw - 0.45, h: ch - 0.8,
      fontSize: 16, color: C.sub, fontFace: FONT, valign: "top", lineSpacingMultiple: 1.15 });
  });
  hint(s, "なんでこんなに色々やってるの？");
  footer(s);
})();

// =====================================================================
// 7. 人生目標 3層構造 ※維持
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
      fill: { color: C.card }, line: { color: c.accent, width: 2.25 } });
    s.addText(c.head, { x: c.x, y: 1.65, w: 3.85, h: 0.45, align: "center",
      fontSize: 19, bold: true, color: c.accent, fontFace: FONT });
    s.addText(c.sub, { x: c.x, y: 2.12, w: 3.85, h: 0.35, align: "center",
      fontSize: 16, color: c.accent, fontFace: FONT });
    s.addText(c.items.map(t => "● " + t).join("\n"), { x: c.x + 0.3, y: 2.55, w: 3.3, h: 2.5,
      fontSize: 16, color: C.sub, fontFace: FONT, valign: "top", lineSpacingMultiple: 1.3 });
  });
  s.addShape("roundRect", { x: 0.55, y: 5.4, w: 12.23, h: 0.95, rectRadius: 0.08,
    fill: { color: C.cardLt }, line: { color: C.green2, width: 2.25 } });
  s.addText("これらの基となるたくさんのバイト in 学生時代", { x: 0.55, y: 5.4, w: 12.23, h: 0.95,
    align: "center", fontSize: 22, bold: true, color: C.white, fontFace: FONT });
  hint(s, "“場を作る”が一番上にある — 今日の後半の伏線です");
  footer(s);
})();

// =====================================================================
// 8. ある1週間の使い方 ※維持
// =====================================================================
(() => {
  const s = newSlide();
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
      fill: { color: C.card }, line: { color: C.border, width: 2 } });
    s.addShape("rect", { x: 1.0, y, w: 0.16, h: 1.0, fill: { color: b.c } });
    s.addText(b.when, { x: 1.35, y, w: 2.6, h: 1.0, valign: "middle",
      fontSize: 17, bold: true, color: b.c, fontFace: FONT });
    s.addText(b.what, { x: 4.1, y, w: 5.3, h: 1.0, valign: "middle",
      fontSize: 19, bold: true, color: C.white, fontFace: FONT });
    s.addText(b.note, { x: 9.5, y, w: 2.7, h: 1.0, valign: "middle", align: "right",
      fontSize: 16, color: C.muted, fontFace: FONT });
    y += 1.13;
  });
  hint(s, "一人の中に、いくつもの顔がある");
  footer(s);
})();

// =====================================================================
// 9. 学生時代のバイト/仕事歴 ※維持
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
      fill: { color: C.card }, line: { color: C.border, width: 2 } });
    s.addImage({ path: p.img, x: p.x + 0.12, y: p.y + 0.12, w: 2.26, h: 2.21, sizing: { type: "contain", w: 2.26, h: 2.21 } });
    s.addText(p.cap, { x: p.x + 2.65, y: p.y, w: 3.5, h: 2.45, valign: "middle",
      fontSize: 18, bold: true, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.15 });
  });
  hint(s, "いろんな仕事がありますが……");
  footer(s);
})();

// =====================================================================
// ★ 職業観セクション：本業「Dell / エンタープライズIT」を深掘り
//    （学校リクエスト：職業観の理解。IT志望クラス向けに数学×IT×暗号も接続）
// =====================================================================

// --- Dell① そもそも何の会社・何のIT？（業界理解） ---
(() => {
  const s = newSlide();
  title(s, "本業のリアル：Dellってどんな仕事？", C.blue);
  s.addShape("roundRect", { x: 1.0, y: 1.5, w: 11.33, h: 1.5, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.blue, width: 2.5 } });
  s.addText([
    { text: "パソコンで有名だけど、僕がいるのは", options: { fontSize: 20, color: C.white } },
    { text: "「企業向けのデータ基盤（ストレージ）」", options: { fontSize: 22, bold: true, color: C.blue } },
    { text: "の部門", options: { fontSize: 20, color: C.white } },
  ], { x: 1.4, y: 1.5, w: 10.5, h: 1.5, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.2 });
  s.addShape("roundRect", { x: 1.0, y: 3.2, w: 11.33, h: 2.15, rectRadius: 0.1,
    fill: { color: C.cardLt }, line: { color: C.border, width: 2 } });
  s.addText([
    { text: "銀行・病院・工場・ゲーム会社……あらゆる企業の\n", options: { fontSize: 21, color: C.white } },
    { text: "「大事なデータ」を預かり、止めずに守る“縁の下の力持ち”\n\n", options: { fontSize: 23, bold: true, color: C.white } },
    { text: "キーワード：エンタープライズIT / インフラ / ストレージ", options: { fontSize: 18, bold: true, color: C.teal } },
  ], { x: 1.4, y: 3.35, w: 10.5, h: 1.85, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "スマホやゲームの向こうには、こういう“見えないIT”が必ずいる");
  footer(s);
})();

// --- Dell② 私の仕事内容（職業観の核・具体） ---
(() => {
  const s = newSlide();
  title(s, "私のDellでの仕事内容");
  s.addShape("roundRect", { x: 1.5, y: 1.4, w: 10.33, h: 1.0, rectRadius: 0.1,
    fill: { color: C.cardLt }, line: { color: C.orange, width: 2.5 } });
  s.addText("世界中の企業のITを、止めずに新しくする「調整役」", { x: 1.5, y: 1.4, w: 10.33, h: 1.0,
    align: "center", valign: "middle", fontSize: 24, bold: true, color: C.orange, fontFace: FONT });
  const rows = [
    { c: C.teal,   l: "アップグレード調整", r: "顧客企業と日程を調整（日本語メール）" },
    { c: C.purple, l: "ワークオーダー管理", r: "作業指示の作成・追跡・完了確認" },
    { c: C.blue,   l: "グローバル連携",     r: "アジア太平洋（APJC）チームと英語でやりとり" },
    { c: C.green2, l: "案件・問い合わせ管理", r: "Salesforceでチケット・顧客対応" },
  ];
  let y = 2.65;
  rows.forEach(b => {
    s.addShape("roundRect", { x: 1.0, y, w: 11.33, h: 0.92, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 2 } });
    s.addShape("rect", { x: 1.0, y, w: 0.22, h: 0.92, fill: { color: b.c } });
    s.addText(b.l, { x: 1.35, y, w: 3.9, h: 0.92, valign: "middle",
      fontSize: 19, bold: true, color: b.c, fontFace: FONT });
    s.addText(b.r, { x: 5.3, y, w: 6.8, h: 0.92, valign: "middle",
      fontSize: 18, color: C.white, fontFace: FONT });
    y += 1.02;
  });
  hint(s, "派手じゃない。でも止まると社会が困る、超重要な裏方の仕事");
  footer(s);
})();

// --- Dell③ 必要なスキル（職業観：required skills） ---
(() => {
  const s = newSlide();
  title(s, "この仕事に必要なスキル", C.teal);
  barList(s, [
    { c: C.coral,  main: "段取り力・正確さ", sub: "1つのミスが、大きな障害につながる世界" },
    { c: C.teal,   main: "調整・コミュニケーション力", sub: "顧客 × 社内 × 海外チームをつなぐ" },
    { c: C.blue,   main: "英語（読み書き中心・完璧じゃなくてOK）", sub: "グローバルなチームで働く" },
    { c: C.purple, main: "ITインフラの基礎知識", sub: "ネットワーク・サーバ・ストレージ" },
    { c: C.green2, main: "学び続ける力", sub: "技術は毎年アップデートされる" },
  ], { y: 1.5, h: 0.86, gap: 0.12 });
  hint(s, "「頭のよさ」より「正確に段取りできること」が効く");
  footer(s);
})();

// --- Dell④ 向いている人・面白さ（職業観：fit） ---
(() => {
  const s = newSlide();
  title(s, "向いている人・この仕事の面白さ");
  const cards = [
    { x: 1.0, accent: C.teal,  head: "向いている人", items: ["コツコツ正確にやれる", "裏方で支えるのが好き", "人との調整が苦じゃない", "英語や新技術に抵抗が少ない"] },
    { x: 7.0, accent: C.orange, head: "この仕事の面白さ", items: ["世界的な企業のインフラを支える誇り", "グローバルに働ける", "IT業界の“土台”がわかる", "止めない＝社会を支えている実感"] },
  ];
  cards.forEach(c => {
    s.addShape("roundRect", { x: c.x, y: 1.55, w: 5.3, h: 3.9, rectRadius: 0.12,
      fill: { color: C.card }, line: { color: c.accent, width: 2.5 } });
    s.addText(c.head, { x: c.x, y: 1.8, w: 5.3, h: 0.7, align: "center",
      fontSize: 24, bold: true, color: c.accent, fontFace: FONT });
    s.addText(c.items.map(t => "・" + t).join("\n"), { x: c.x + 0.45, y: 2.6, w: 4.4, h: 2.7,
      fontSize: 18, bold: true, color: C.white, fontFace: FONT, valign: "top", lineSpacingMultiple: 1.45 });
  });
  hint(s, "主役じゃなくても、世界を動かせる仕事がある");
  footer(s);
})();

// --- Dell⑤ IT志望のキミへ：数学 × IT × 暗号（バックボーン） ---
(() => {
  const s = newSlide();
  title(s, "IT志望のキミへ：数学 × IT × 暗号", C.purple);
  s.addShape("roundRect", { x: 1.0, y: 1.4, w: 11.33, h: 1.05, rectRadius: 0.1,
    fill: { color: C.cardLt }, line: { color: C.purple, width: 2.5 } });
  s.addText([
    { text: "僕のIT人生は「数学」から始まった　", options: { fontSize: 20, color: C.white } },
    { text: "（中央大 → 都立大院で数学専攻）", options: { fontSize: 17, color: C.muted } },
  ], { x: 1.0, y: 1.4, w: 11.33, h: 1.05, align: "center", valign: "middle", fontFace: FONT });
  const rows = [
    { c: C.teal,   l: "暗号 × 実装", r: "量子でも破れない暗号（PQC）を Julia で実装" },
    { c: C.orange, l: "発信",       r: "数学YouTube「うえもっちゃん」／同人誌で解説" },
    { c: C.blue,   l: "Web開発",     r: "Next.js・Supabase でアプリ／SNS を開発" },
    { c: C.green2, l: "教育",       r: "元SAPIX講師・家庭教師 → 情報の教員免許へ" },
  ];
  let y = 2.65;
  rows.forEach(b => {
    s.addShape("roundRect", { x: 1.0, y, w: 11.33, h: 0.82, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 2 } });
    s.addShape("rect", { x: 1.0, y, w: 0.22, h: 0.82, fill: { color: b.c } });
    s.addText(b.l, { x: 1.35, y, w: 2.7, h: 0.82, valign: "middle",
      fontSize: 18, bold: true, color: b.c, fontFace: FONT });
    s.addText(b.r, { x: 4.15, y, w: 7.9, h: 0.82, valign: "middle",
      fontSize: 17, color: C.white, fontFace: FONT });
    y += 0.92;
  });
  hint(s, "IT＝コードだけじゃない。数学も英語も「伝える力」も、全部つながって武器になる");
  footer(s);
})();

// =====================================================================
// 10. 仕事に何を求めますか？？（問い）※維持
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("仕事に何を求めますか？？", { x: 0.5, y: 2.6, w: 12.3, h: 1.4, align: "center",
    fontSize: 46, bold: true, color: C.white, fontFace: FONT });
  s.addText("※複数OKです", { x: 0.5, y: 4.1, w: 12.3, h: 0.6, align: "center",
    fontSize: 20, color: C.muted, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 11. WORK① まず書いてみよう（2分）
// =====================================================================
(() => {
  const s = newSlide();
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
      fill: { color: C.card }, line: { color: ch.c, width: 2.5 } });
    s.addText(ch.t, { x: cx, y: 2.45, w: cw, h: 0.95, align: "center",
      fontSize: 22, bold: true, color: ch.c, fontFace: FONT });
    cx += cw + gap;
  });
  s.addShape("roundRect", { x: 1.6, y: 3.9, w: 10.13, h: 2.2, rectRadius: 0.1,
    fill: { color: C.cardLt }, line: { color: C.orange, width: 2.25 } });
  s.addText([
    { text: "① 上の5つから、自分が大事だと思うものを選ぶ（複数OK）\n", options: { fontSize: 20, color: C.white, bold: true } },
    { text: "② 「なぜそれが大事か」を一言メモ\n", options: { fontSize: 20, color: C.white, bold: true } },
    { text: "③ 5つ以外でもOK（例：自由な時間、好きな人と働く…）", options: { fontSize: 20, color: C.white, bold: true } },
  ], { x: 2.0, y: 4.1, w: 9.3, h: 1.8, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.25 });
  s.addText("⏱ 制限時間 2分 — 紙でも、頭の中でもOK", { x: 0.5, y: 6.25, w: 12.3, h: 0.6,
    align: "center", fontSize: 22, bold: true, color: C.orange, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 12. WORK② みんなのを見てみよう（発表）
// =====================================================================
(() => {
  const s = newSlide();
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
      fill: { color: C.card }, line: { color: C.border, width: 2 } });
    s.addShape("rect", { x: 1.6, y, w: 0.14, h: 0.95, fill: { color: r.c } });
    s.addText(r.t, { x: 2.0, y, w: 9.5, h: 0.95, valign: "middle",
      fontSize: 22, bold: true, color: C.white, fontFace: FONT });
    y += 1.15;
  });
  s.addText("👉 答えは人によってバラバラ。それで正解。", { x: 0.5, y: 6.15, w: 12.3, h: 0.6,
    align: "center", fontSize: 22, bold: true, color: C.teal, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 13. 答えはバラバラでいい
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("答えは、人によってバラバラ", { x: 0.5, y: 2.1, w: 12.3, h: 1.0, align: "center",
    fontSize: 40, bold: true, color: C.white, fontFace: FONT });
  s.addText("それで、いい。", { x: 0.5, y: 3.3, w: 12.3, h: 0.9, align: "center",
    fontSize: 36, bold: true, color: C.teal, fontFace: FONT });
  s.addText("でも——全部を「1つの仕事」で満たそうとすると、ちょっと苦しい。", { x: 0.5, y: 4.6, w: 12.3, h: 0.7,
    align: "center", fontSize: 20, color: C.muted, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 14. 〔章扉〕柱① 分散
// =====================================================================
chapter("ここからが、1つ目の柱", "柱 ①", "分散", "一つに全部を賭けない", C.teal);

// =====================================================================
// 15. 5要素（答え合わせ）
// =====================================================================
(() => {
  const s = newSlide();
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
      fill: { color: C.card }, line: { color: it.c, width: 2.75 } });
    s.addText(it.t, { x: cx, y: 2.9, w: cw, h: 1.6, align: "center", valign: "middle",
      fontSize: 24, bold: true, color: it.c, fontFace: FONT });
    cx += cw + gap;
  });
  footer(s);
})();

// =====================================================================
// 16. 全部満たせる仕事ある？
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("全部満たせる仕事、\n見つかりますか？", { x: 0.5, y: 2.3, w: 12.3, h: 2.2, align: "center",
    fontSize: 46, bold: true, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.15 });
  footer(s);
})();

// =====================================================================
// 17. ムリだと思った
// =====================================================================
(() => {
  const s = newSlide();
  s.addText([
    { text: "”すっごく”ムリムリだ\n", options: { color: C.orange } },
    { text: "と思いました……", options: { color: C.white } },
  ], { x: 0.5, y: 2.4, w: 12.3, h: 2.0, align: "center",
    fontSize: 44, bold: true, fontFace: FONT, lineSpacingMultiple: 1.15 });
  footer(s);
})();

// =====================================================================
// 18. そこで
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("そこで", { x: 0.5, y: 3.0, w: 12.3, h: 1.4, align: "center",
    fontSize: 54, bold: true, color: C.teal, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 19. 集中のメリット・デメリット
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "「集中」のいいところ・しんどいところ", C.coral);
  s.addShape("roundRect", { x: 1.0, y: 1.7, w: 11.33, h: 1.7, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.green2, width: 2.25 } });
  s.addText([
    { text: "◎ いいところ\n", options: { fontSize: 18, bold: true, color: C.green2 } },
    { text: "・深く極められる／一点を突き抜けられる\n・「これが私」と言いやすい", options: { fontSize: 19, color: C.white } },
  ], { x: 1.4, y: 1.85, w: 10.5, h: 1.4, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.2 });
  s.addShape("roundRect", { x: 1.0, y: 3.6, w: 11.33, h: 1.7, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.coral, width: 2.25 } });
  s.addText([
    { text: "△ しんどいところ\n", options: { fontSize: 18, bold: true, color: C.coral } },
    { text: "・コケたとき、全部いっぺんに失う\n・視野がせまくなりがち", options: { fontSize: 19, color: C.white } },
  ], { x: 1.4, y: 3.75, w: 10.5, h: 1.4, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "じゃあ「分散」はどうだろう？");
  footer(s);
})();

// =====================================================================
// 20. 分散のメリット・デメリット
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "「分散」のいいところ・しんどいところ", C.teal);
  s.addShape("roundRect", { x: 1.0, y: 1.55, w: 11.33, h: 1.9, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.green2, width: 2.25 } });
  s.addText([
    { text: "◎ いいところ\n", options: { fontSize: 18, bold: true, color: C.green2 } },
    { text: "・リスクが分かれる（1つコケても平気）\n・違う活動どうしが「掛け算」になる\n・無理がないから、長く続けられる", options: { fontSize: 19, color: C.white } },
  ], { x: 1.4, y: 1.7, w: 10.5, h: 1.6, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.2 });
  s.addShape("roundRect", { x: 1.0, y: 3.6, w: 11.33, h: 1.5, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.coral, width: 2.25 } });
  s.addText([
    { text: "△ しんどいところ\n", options: { fontSize: 18, bold: true, color: C.coral } },
    { text: "・すぐには突き抜けない／時間がかかる", options: { fontSize: 19, color: C.white } },
  ], { x: 1.4, y: 3.75, w: 10.5, h: 1.2, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "高校生の今は「分散」が向いている、というのが今日の提案");
  footer(s);
})();

// =====================================================================
// 21. 分散フレーム（岡田斗司夫）
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("一つの仕事に「全部」を求めない ： 分散", { x: 0.4, y: 0.5, w: 12.5, h: 0.8,
    align: "center", fontSize: 30, bold: true, color: C.white, fontFace: FONT });
  s.addText("岡田斗司夫さんの考え方より", { x: 0.6, y: 1.3, w: 12, h: 0.4,
    fontSize: 16, color: C.muted, fontFace: FONT });
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
      fill: { color: C.card }, line: { color: j.c, width: 2 } });
    s.addText(j.val, { x: cx, y: 3.2, w: cw, h: 1.0, align: "center", valign: "middle",
      fontSize: 20, bold: true, color: j.c, fontFace: FONT });
    cx += cw + gap;
  });
  s.addText("お金はA、やりがいはB、人間関係はC……と「分けて」手に入れる", { x: 0.5, y: 4.7, w: 12.3, h: 0.7,
    align: "center", fontSize: 20, color: C.white, fontFace: FONT });
  hint(s, "これを自分に当てはめると……");
  footer(s);
})();

// =====================================================================
// 22. 私の場合
// =====================================================================
(() => {
  const s = newSlide();
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
      fill: { color: C.card }, line: { color: C.border, width: 2 } });
    s.addShape("rect", { x: 1.5, y, w: 0.16, h: 0.9, fill: { color: b.c } });
    s.addText(b.l, { x: 1.9, y, w: 6.5, h: 0.9, valign: "middle",
      fontSize: 21, bold: true, color: C.white, fontFace: FONT });
    s.addText("→ " + b.r, { x: 8.5, y, w: 3.0, h: 0.9, valign: "middle",
      fontSize: 20, bold: true, color: b.c, fontFace: FONT });
    y += 1.02;
  });
  s.addShape("roundRect", { x: 1.5, y: 5.85, w: 10.33, h: 0.85, rectRadius: 0.08,
    fill: { color: C.cardLt }, line: { color: C.green2, width: 2.25 } });
  s.addText("一つの仕事が多少しんどくても、他のところでバランスが取れる", { x: 1.5, y: 5.85, w: 10.33, h: 0.85,
    align: "center", valign: "middle", fontSize: 18, bold: true, color: C.white, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 23. 分散の誤解（器用貧乏では？）→反論
// =====================================================================
(() => {
  const s = newSlide();
  s.addShape("roundRect", { x: 2.0, y: 0.9, w: 9.33, h: 0.9, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.coral, width: 2.5 } });
  s.addText("「分散って、ただの器用貧乏では？」", { x: 2.0, y: 0.9, w: 9.33, h: 0.9,
    align: "center", valign: "middle", fontSize: 24, bold: true, color: C.coral, fontFace: FONT });
  s.addText("——よく言われます。でも、こう考えています。", { x: 0.5, y: 2.0, w: 12.3, h: 0.5,
    align: "center", fontSize: 16, color: C.muted, fontFace: FONT });
  barList(s, [
    { c: C.teal,   main: "① 突き抜ける人も、最初は「いろいろ試す」から始まっている" },
    { c: C.purple, main: "② バラバラの経験は、つながると「自分だけの武器」になる" },
    { c: C.green2, main: "③ 続けられる人が、結局いちばん遠くまで行ける" },
  ], { y: 2.7, h: 1.05, gap: 0.25 });
  footer(s);
})();

// =====================================================================
// 24. 分散は「掛け算」になる
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "バラバラの「好き」は、ある日つながる", C.orange);
  s.addText("分散は、足し算じゃなくて掛け算になる", { x: 0.5, y: 1.2, w: 12.3, h: 0.5,
    align: "center", fontSize: 18, color: C.muted, fontFace: FONT });
  const eqs = [
    { a: "数学",   b: "プログラミング", r: "量子でも破れない暗号を実装", c: C.teal },
    { a: "カメラ", b: "教育",           r: "教材・スクール撮影",         c: C.purple },
    { a: "企画",   b: "コミュニティ",   r: "イベント運営",               c: C.green2 },
  ];
  let y = 1.95;
  eqs.forEach(e => {
    s.addShape("roundRect", { x: 1.2, y, w: 10.93, h: 1.25, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: e.c, width: 2.25 } });
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
  footer(s);
})();

// =====================================================================
// 25. とにかく失敗が多かった
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "とにかく失敗が多かった……", C.white);
  const items = [
    { n: "1", t: "インターン2社同時 → 電車に2社分のPCを忘れた", c: C.coral },
    { n: "2", t: "大学を留年した（学費は自分で払った……）",     c: C.orange },
    { n: "3", t: "仕事でも同じ構造のミスを繰り返した",           c: C.teal },
  ];
  let y = 1.75;
  items.forEach(it => {
    s.addShape("roundRect", { x: 1.2, y, w: 10.93, h: 1.1, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 2 } });
    s.addShape("ellipse", { x: 1.45, y: y + 0.28, w: 0.55, h: 0.55, fill: { color: it.c } });
    s.addText(it.n, { x: 1.45, y: y + 0.28, w: 0.55, h: 0.55, align: "center", valign: "middle",
      fontSize: 22, bold: true, color: C.bg, fontFace: FONT });
    s.addText(it.t, { x: 2.25, y, w: 9.7, h: 1.1, valign: "middle",
      fontSize: 21, bold: true, color: C.white, fontFace: FONT });
    y += 1.3;
  });
  hint(s, "中でも忘れられないのが……");
  footer(s);
})();

// =====================================================================
// 26. 失敗①PC
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("失敗エピソード ①", { x: 0.6, y: 0.4, w: 12, h: 0.6, fontSize: 18, color: C.coral, fontFace: FONT });
  s.addText("インターンを2社、同時にやった結果……", { x: 0.5, y: 1.1, w: 12.3, h: 0.9,
    align: "center", fontSize: 30, bold: true, color: C.white, fontFace: FONT });
  s.addShape("roundRect", { x: 1.5, y: 2.4, w: 10.33, h: 2.6, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.coral, width: 2.25 } });
  s.addText([
    { text: "電車に、2社分のノートPCを忘れた\n\n", options: { fontSize: 26, bold: true, color: C.coral } },
    { text: "頭が真っ白。会社にも平謝り。\n「両立」って、見た目以上に難しい。", options: { fontSize: 20, color: C.white } },
  ], { x: 1.9, y: 2.6, w: 9.5, h: 2.2, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "※どうやって取り返したかは、Q&Aで");
  footer(s);
})();

// =====================================================================
// 27. 失敗②留年
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("失敗エピソード ②", { x: 0.6, y: 0.4, w: 12, h: 0.6, fontSize: 18, color: C.orange, fontFace: FONT });
  s.addText("大学を、留年した", { x: 0.5, y: 1.1, w: 12.3, h: 0.9,
    align: "center", fontSize: 34, bold: true, color: C.white, fontFace: FONT });
  s.addShape("roundRect", { x: 1.5, y: 2.4, w: 10.33, h: 2.6, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.orange, width: 2.25 } });
  s.addText([
    { text: "色々やりすぎて、単位を落とした。\n学費は、自分で払った。\n\n", options: { fontSize: 22, color: C.white } },
    { text: "正直しんどかった。でも——「終わり」ではなかった。", options: { fontSize: 22, bold: true, color: C.orange } },
  ], { x: 1.9, y: 2.6, w: 9.5, h: 2.2, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.2 });
  footer(s);
})();

// =====================================================================
// 28. でも、折れなかった
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("でも、折れなかった", { x: 0.5, y: 1.5, w: 12.3, h: 1.0, align: "center",
    fontSize: 42, bold: true, color: C.teal, fontFace: FONT });
  s.addShape("roundRect", { x: 1.5, y: 2.9, w: 10.33, h: 2.3, rectRadius: 0.1,
    fill: { color: C.cardLt }, line: { color: C.teal, width: 2.5 } });
  s.addText([
    { text: "一つコケても、他の活動が残っていたから。\n", options: { fontSize: 24, bold: true, color: C.white } },
    { text: "\n「分散」は、心を守るセーフティネットにもなる。", options: { fontSize: 22, bold: true, color: C.teal } },
  ], { x: 1.9, y: 3.1, w: 9.5, h: 1.9, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "だから、進路の話に戻ります");
  footer(s);
})();

// =====================================================================
// 29. 明治に上がる人へ（内部進学）
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "明治に上がる人へ", C.orange);
  s.addShape("roundRect", { x: 1.2, y: 1.6, w: 10.93, h: 1.5, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.green2, width: 2.5 } });
  s.addText([
    { text: "内部進学は、立派な選択。\n", options: { fontSize: 24, bold: true, color: C.green2 } },
    { text: "「分散しよう」は、レールを否定する話じゃない。", options: { fontSize: 20, color: C.white } },
  ], { x: 1.6, y: 1.75, w: 10.1, h: 1.2, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.15 });
  s.addShape("roundRect", { x: 1.2, y: 3.35, w: 10.93, h: 2.3, rectRadius: 0.1,
    fill: { color: C.cardLt }, line: { color: C.orange, width: 2.75 } });
  s.addText([
    { text: "その上で——\n", options: { fontSize: 20, color: C.muted } },
    { text: "「大学の4年間で “何を” 分散させるか」\n", options: { fontSize: 28, bold: true, color: C.white } },
    { text: "を、今から考えておくと、めちゃくちゃ強い。", options: { fontSize: 22, bold: true, color: C.orange } },
  ], { x: 1.6, y: 3.55, w: 10.1, h: 1.9, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.2 });
  hint(s, "じゃあ、何を分散させる？");
  footer(s);
})();

// =====================================================================
// 30. 大学の4年間で何を分散させる？
// =====================================================================
(() => {
  const s = newSlide();
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
      fill: { color: C.card }, line: { color: g.c, width: 2.25 } });
    s.addText([
      { text: g.emoji + " ", options: { fontSize: 17 } },
      { text: g.head, options: { fontSize: 17, bold: true, color: g.c } },
    ], { x: x + 0.2, y: y + 0.15, w: cw - 0.4, h: 0.5, fontFace: FONT });
    s.addText(g.items.join("\n"), { x: x + 0.25, y: y + 0.75, w: cw - 0.45, h: ch - 0.85,
      fontSize: 16, color: C.sub, fontFace: FONT, valign: "top" });
  });
  hint(s, "全部やらなくていい。種を「複数」まいておくだけ");
  footer(s);
})();

// =====================================================================
// 31. 進路を「分散」しませんか（高1向け）
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("そこで提案します！", { x: 0.6, y: 0.35, w: 12, h: 0.5, fontSize: 18, color: C.muted, fontFace: FONT });
  s.addText("進路を「分散」しませんか", { x: 0.4, y: 0.85, w: 12.5, h: 1.0, align: "center",
    fontSize: 44, bold: true, color: C.white, fontFace: FONT });
  barList(s, [
    { c: C.teal,   main: "「好き」は、複数持っておいていい", sub: "一つに絞らなくていい。今のうちに増やしておく" },
    { c: C.purple, main: "没頭できる物語は無数にある",       sub: "——燃え尽きるほど一点に賭けなくていい" },
    { c: C.white,  main: "これからの3年間・大学の4年間をどう使うか", sub: "進路は“いつ決めるか”より“どう分散させておくか”" },
  ], { y: 2.15, h: 1.25, gap: 0.15 });
  hint(s, "……でも、分散には、もう一つ大事な相棒がいます");
  footer(s);
})();

// =====================================================================
// 32. 〔章扉〕柱② 場をつくる
// =====================================================================
chapter("そして、もう一つの柱", "柱 ②", "場をつくる", "「客」をやめて、つくる側に回る", C.orange);

// =====================================================================
// 33. もう一つだけ。「客」をやめてみる ★
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "もう一つだけ。「客」をやめてみる", C.orange);
  s.addShape("roundRect", { x: 1.2, y: 1.7, w: 10.93, h: 1.7, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.border, width: 2 } });
  s.addText("イベントも、部活も、教室も——\n参加する「だけ」じゃなく、つくる側／運営側に一回立ってみる",
    { x: 1.6, y: 1.7, w: 10.1, h: 1.7, valign: "middle", align: "center",
      fontSize: 22, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.25 });
  s.addText("見える景色が、180°変わる", { x: 0.5, y: 3.9, w: 12.3, h: 1.2, align: "center",
    fontSize: 40, bold: true, color: C.orange, fontFace: FONT });
  hint(s, "文化祭、お客さんで回るのと企画する側。どっちが記憶に残る？");
  footer(s);
})();

// =====================================================================
// 34. そもそも「場」って？
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "そもそも「場」って？");
  s.addShape("roundRect", { x: 2.0, y: 1.7, w: 9.33, h: 1.2, rectRadius: 0.1,
    fill: { color: C.cardLt }, line: { color: C.teal, width: 2.5 } });
  s.addText("人が集まって、何かが生まれるところ", { x: 2.0, y: 1.7, w: 9.33, h: 1.2,
    align: "center", valign: "middle", fontSize: 26, bold: true, color: C.white, fontFace: FONT });
  const chips = ["教室", "部活", "コミケ", "LINEグループ", "文化祭", "この講話も"];
  const cw = 3.7, ch = 0.85, gx = 0.25, gy = 0.25, x0 = 1.35, y0 = 3.3;
  const cols = [C.teal, C.purple, C.coral, C.green2, C.orange, C.blue];
  chips.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = x0 + col * (cw + gx), y = y0 + row * (ch + gy);
    s.addShape("roundRect", { x, y, w: cw, h: ch, rectRadius: 0.4,
      fill: { color: C.card }, line: { color: cols[i], width: 2.25 } });
    s.addText(t, { x, y, w: cw, h: ch, align: "center", valign: "middle",
      fontSize: 19, bold: true, color: cols[i], fontFace: FONT });
  });
  hint(s, "大それたものじゃない。2人集まれば、もう「場」。");
  footer(s);
})();

// =====================================================================
// 35. 客 vs 主催（対比）
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "「客」と「つくる側」、何が違う？");
  const cards = [
    { x: 1.0, accent: C.coral, head: "客のまま", items: ["受け取るだけ", "記憶に残りにくい", "つながりは浅い"] },
    { x: 7.0, accent: C.teal,  head: "つくる側", items: ["自分ごとになる", "濃い経験が残る", "人とつながる"] },
  ];
  cards.forEach(c => {
    s.addShape("roundRect", { x: c.x, y: 1.6, w: 5.3, h: 3.5, rectRadius: 0.12,
      fill: { color: C.card }, line: { color: c.accent, width: 2.5 } });
    s.addText(c.head, { x: c.x, y: 1.85, w: 5.3, h: 0.7, align: "center",
      fontSize: 26, bold: true, color: c.accent, fontFace: FONT });
    s.addText(c.items.map(t => "・" + t).join("\n"), { x: c.x + 0.5, y: 2.7, w: 4.3, h: 2.2,
      fontSize: 21, color: C.white, fontFace: FONT, valign: "top", lineSpacingMultiple: 1.5 });
  });
  s.addText("一回でいいから、つくる側に立ってみてほしい", { x: 0.5, y: 5.5, w: 12.3, h: 0.7,
    align: "center", fontSize: 22, bold: true, color: C.orange, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 36. 場づくりの具体例
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "僕がつくってきた「場」", C.green2);
  const grid = [
    { emoji: "🏛", head: "コミケ運営",   sub: "更衣室担当のスタッフ", c: C.blue },
    { emoji: "🏫", head: "まなびの場",   sub: "まなびハウス",         c: C.coral },
    { emoji: "🚌", head: "バス旅行",     sub: "企画・運営・運転まで", c: C.green2 },
    { emoji: "🎤", head: "この講話",     sub: "今この時間も一つの場", c: C.orange },
  ];
  const cw = 5.5, ch = 1.85, gx = 0.4, gy = 0.35, x0 = 1.0, y0 = 1.6;
  grid.forEach((g, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = x0 + col * (cw + gx), y = y0 + row * (ch + gy);
    s.addShape("roundRect", { x, y, w: cw, h: ch, rectRadius: 0.1,
      fill: { color: C.card }, line: { color: g.c, width: 2.25 } });
    s.addText(g.emoji, { x: x + 0.3, y, w: 1.1, h: ch, align: "center", valign: "middle", fontSize: 36, fontFace: FONT });
    s.addText([
      { text: g.head + "\n", options: { fontSize: 22, bold: true, color: g.c } },
      { text: g.sub, options: { fontSize: 16, color: C.sub } },
    ], { x: x + 1.5, y, w: cw - 1.7, h: ch, valign: "middle", fontFace: FONT, lineSpacingMultiple: 1.2 });
  });
  hint(s, "バラバラに見える活動、実は全部「場」だった");
  footer(s);
})();

// =====================================================================
// 37. 場は、小さくていい
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("場は、小さくていい", { x: 0.5, y: 1.4, w: 12.3, h: 1.0, align: "center",
    fontSize: 44, bold: true, color: C.teal, fontFace: FONT });
  barList(s, [
    { c: C.teal,   main: "友だち2人で始める勉強会" },
    { c: C.purple, main: "好きな人を集めた撮影会・上映会" },
    { c: C.orange, main: "クラスの小さな企画・出し物" },
  ], { y: 2.9, h: 0.95, gap: 0.25 });
  s.addText("いきなり大きくしなくていい。小さく始める。", { x: 0.5, y: 6.2, w: 12.3, h: 0.6,
    align: "center", fontSize: 20, color: C.muted, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 38. つくる側で、人とつながれた（実体験）
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "つくる側に回って、変わったこと");
  s.addShape("roundRect", { x: 1.2, y: 1.7, w: 10.93, h: 3.5, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.green2, width: 2.25 } });
  s.addText([
    { text: "コミケの更衣室担当、まなびの場づくり——\n", options: { fontSize: 22, color: C.white } },
    { text: "「参加者」から「運営」に回った瞬間、\n", options: { fontSize: 22, color: C.white } },
    { text: "急に、人とつながれた。\n\n", options: { fontSize: 26, bold: true, color: C.green2 } },
    { text: "バラバラだった僕の活動が、\n「場」を通して、人とつながっていった。", options: { fontSize: 22, bold: true, color: C.white } },
  ], { x: 1.7, y: 1.9, w: 9.9, h: 3.1, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.25 });
  footer(s);
})();

// =====================================================================
// 39. 場をつくると、人との「間」がなくなる ★（人生目標コールバック）
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "場をつくると、人との「間」がなくなる", C.orange);
  s.addShape("roundRect", { x: 1.2, y: 1.65, w: 10.93, h: 2.0, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.border, width: 2 } });
  s.addText([
    { text: "自分の「場」を持つと、そこに人が集まる。\n", options: { fontSize: 22, color: C.white } },
    { text: "分散していたバラバラの点が、場を通してつながる。", options: { fontSize: 22, color: C.white } },
  ], { x: 1.6, y: 1.65, w: 10.1, h: 2.0, valign: "middle", align: "center", fontFace: FONT, lineSpacingMultiple: 1.3 });
  s.addShape("roundRect", { x: 2.5, y: 3.95, w: 8.33, h: 1.3, rectRadius: 0.12,
    fill: { color: C.cardLt }, line: { color: C.orange, width: 2.75 } });
  s.addText("分散 × 場づくり ＝ 自分の生き方", { x: 2.5, y: 3.95, w: 8.33, h: 1.3,
    align: "center", valign: "middle", fontSize: 30, bold: true, color: C.orange, fontFace: FONT });
  hint(s, "そういえば、僕の人生目標は……");
  footer(s);
})();

// =====================================================================
// 40. 分散 × 場づくり：点が線になる（図）
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "バラバラの点が、場を通して「線」になる");
  const mx = 6.66, my = 3.7;          // 中心（場）
  const dots = [
    { x: 2.0,  y: 2.2, t: "本業",       c: C.teal },
    { x: 11.0, y: 2.2, t: "カメラ",     c: C.purple },
    { x: 1.5,  y: 4.6, t: "執筆",       c: C.orange },
    { x: 11.4, y: 4.6, t: "教育",       c: C.coral },
    { x: 6.66, y: 5.6, t: "コミュニティ", c: C.green2 },
  ];
  // 線（先に描いてノードを上に重ねる）
  dots.forEach(d => {
    const x = Math.min(d.x, mx), y = Math.min(d.y, my);
    const w = Math.abs(d.x - mx), h = Math.abs(d.y - my);
    const flipV = (Math.sign(d.x - mx) !== Math.sign(d.y - my));
    s.addShape("line", { x, y, w, h, line: { color: C.border, width: 2.5 }, flipV });
  });
  // 中心「場」
  s.addShape("roundRect", { x: mx - 1.0, y: my - 0.55, w: 2.0, h: 1.1, rectRadius: 0.12,
    fill: { color: C.orange } });
  s.addText("場", { x: mx - 1.0, y: my - 0.55, w: 2.0, h: 1.1, align: "center", valign: "middle",
    fontSize: 30, bold: true, color: C.bg, fontFace: FONT });
  // 点
  dots.forEach(d => {
    s.addShape("ellipse", { x: d.x - 0.7, y: d.y - 0.35, w: 1.4, h: 0.7,
      fill: { color: C.card }, line: { color: d.c, width: 2.5 } });
    s.addText(d.t, { x: d.x - 0.85, y: d.y - 0.35, w: 1.7, h: 0.7, align: "center", valign: "middle",
      fontSize: 16, bold: true, color: d.c, fontFace: FONT });
  });
  hint(s, "分散（点）× 場づくり（つなぐ）＝ 自分だけの形");
  footer(s);
})();

// =====================================================================
// 41. 高校でできる「場づくり」の一歩
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "高校で、今からできる「場づくり」", C.orange);
  barList(s, [
    { c: C.coral,  main: "文化祭・体育祭の実行委員に手を挙げる" },
    { c: C.teal,   main: "部活で、新しい企画を自分から立てる" },
    { c: C.purple, main: "小さな集まり（勉強会・撮影会）を主催する" },
    { c: C.green2, main: "SNSで発信して、人を集めてみる" },
  ], { y: 1.75, h: 1.05, gap: 0.22 });
  hint(s, "一回でいい。「客」から「つくる側」へ");
  footer(s);
})();

// =====================================================================
// 42. おさらい：2つの柱
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "今日の2つの柱");
  const cards = [
    { x: 1.0, accent: C.teal,   tag: "柱 ①", head: "分散", sub: "好きを複数持つ\n一つに全部賭けない" },
    { x: 7.0, accent: C.orange, tag: "柱 ②", head: "場をつくる", sub: "「客」をやめて\nつくる側に回る" },
  ];
  cards.forEach(c => {
    s.addShape("roundRect", { x: c.x, y: 1.7, w: 5.3, h: 3.6, rectRadius: 0.12,
      fill: { color: C.card }, line: { color: c.accent, width: 2.75 } });
    s.addText(c.tag, { x: c.x, y: 2.0, w: 5.3, h: 0.5, align: "center",
      fontSize: 18, color: c.accent, fontFace: FONT });
    s.addText(c.head, { x: c.x, y: 2.55, w: 5.3, h: 1.0, align: "center",
      fontSize: 40, bold: true, color: C.white, fontFace: FONT });
    s.addText(c.sub, { x: c.x + 0.3, y: 3.7, w: 4.7, h: 1.3, align: "center",
      fontSize: 19, color: c.accent, fontFace: FONT, lineSpacingMultiple: 1.2 });
  });
  s.addText("✕", { x: 6.16, y: 2.9, w: 1.0, h: 1.0, align: "center", valign: "middle",
    fontSize: 36, bold: true, color: C.muted, fontFace: FONT });
  s.addText("この2本で、進路の話に戻ります", { x: 0.5, y: 5.6, w: 12.3, h: 0.6,
    align: "center", fontSize: 20, color: C.muted, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 43. 進路に「失敗」はない ※維持（強い）
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("(たくさん失敗した植元が言う)", { x: 0.5, y: 0.4, w: 12.3, h: 0.5, align: "center",
    fontSize: 16, color: C.muted, fontFace: FONT });
  s.addText("進路に「失敗」はない", { x: 0.4, y: 0.85, w: 12.5, h: 0.9, align: "center",
    fontSize: 36, bold: true, color: C.orange, fontFace: FONT });
  s.addShape("roundRect", { x: 1.0, y: 2.0, w: 11.33, h: 3.6, rectRadius: 0.1,
    fill: { color: C.card }, line: { color: C.border, width: 2 } });
  s.addText("大学でも大学院でも専門でも就職でも、内部進学でも、", { x: 1.4, y: 2.3, w: 10.5, h: 0.6,
    fontSize: 20, color: C.white, fontFace: FONT });
  s.addText("「なぜその選択をしたか」", { x: 1.0, y: 3.0, w: 11.33, h: 1.2, align: "center",
    fontSize: 42, bold: true, color: C.orange, fontFace: FONT });
  s.addText("を言えれば問題ない！", { x: 1.0, y: 4.35, w: 11.33, h: 0.8, align: "right",
    fontSize: 28, bold: true, color: C.white, fontFace: FONT });
  s.addText("失敗も、色々も、普通じゃないルートも —— 理由があれば「自分の進路」", { x: 0.5, y: 6.0, w: 12.3, h: 0.5,
    align: "center", fontSize: 16, color: C.muted, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 44. 今日からできること（分散＋場づくり）
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "高校生活で、今日からできること", C.teal);
  barList(s, [
    { c: C.teal,   main: "1. 好きなことを「3つ」書き出す", sub: "［分散］" },
    { c: C.green2, main: "2. やったことないことを「1つ」試す", sub: "［分散］" },
    { c: C.orange, main: "3. 一度でいいから、つくる側に立つ", sub: "［場づくり］" },
    { c: C.purple, main: "4. 小さく発信する（SNS・文章・動画）", sub: "［場づくり］" },
  ], { y: 1.7, h: 1.05, gap: 0.2 });
  hint(s, "大きく変えなくていい。種を増やすだけ");
  footer(s);
})();

// =====================================================================
// 45. 今日の持ち帰り（3点）
// =====================================================================
(() => {
  const s = newSlide();
  title(s, "今日の持ち帰り", C.orange);
  const items = [
    { n: "1", c: C.teal,   t: "進路も「好き」も、複数あっていい（分散）" },
    { n: "2", c: C.orange, t: "「客」をやめて、つくる側に回る（場づくり）" },
    { n: "3", c: C.purple, t: "進路に「失敗」はない（理由を言えれば自分の進路）" },
  ];
  let y = 1.75;
  items.forEach(it => {
    s.addShape("roundRect", { x: 1.2, y, w: 10.93, h: 1.25, rectRadius: 0.1,
      fill: { color: C.card }, line: { color: it.c, width: 2.5 } });
    s.addShape("ellipse", { x: 1.5, y: y + 0.32, w: 0.6, h: 0.6, fill: { color: it.c } });
    s.addText(it.n, { x: 1.5, y: y + 0.32, w: 0.6, h: 0.6, align: "center", valign: "middle",
      fontSize: 24, bold: true, color: C.bg, fontFace: FONT });
    s.addText(it.t, { x: 2.35, y, w: 9.6, h: 1.25, valign: "middle",
      fontSize: 20, bold: true, color: C.white, fontFace: FONT });
    y += 1.45;
  });
  footer(s);
})();

// =====================================================================
// 46. 人生目標で締め（着地）
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("最後に、もう一度", { x: 0.5, y: 0.9, w: 12.3, h: 0.6, align: "center",
    fontSize: 18, color: C.muted, fontFace: FONT });
  s.addShape("roundRect", { x: 1.0, y: 1.7, w: 11.33, h: 1.5, rectRadius: 0.12,
    fill: { color: C.cardLt }, line: { color: C.orange, width: 2.75 } });
  s.addText("「人と人の間に場を作り、間をなくす」", { x: 1.0, y: 1.7, w: 11.33, h: 1.5,
    align: "center", valign: "middle", fontSize: 30, bold: true, color: C.orange, fontFace: FONT });
  s.addText("今日の話は、ぜんぶここにつながっています。\n分散して、場をつくる。それが、僕の生き方です。",
    { x: 0.5, y: 3.5, w: 12.3, h: 1.5, align: "center",
      fontSize: 22, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.3 });
  s.addText("ありがとうございました。", { x: 0.5, y: 5.4, w: 12.3, h: 0.8, align: "center",
    fontSize: 26, bold: true, color: C.teal, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 47. Q & A
// =====================================================================
(() => {
  const s = newSlide();
  s.addText("なんでも聞いてください", { x: 0.7, y: 0.4, w: 12, h: 0.8,
    fontSize: 30, bold: true, color: C.white, fontFace: FONT });
  s.addText("Q & A", { x: 0.7, y: 1.2, w: 12, h: 1.4,
    fontSize: 64, bold: true, color: C.orange, fontFace: FONT });
  const topics = [
    "IT業界って実際どう？", "数学は仕事で役に立つ？", "Dellの仕事のリアル",
    "大学の4年間、どう使う？", "「場」のつくり方・はじめ方", "お金・給料・失敗談",
  ];
  const cw = 3.85, ch = 0.95, gx = 0.2, gy = 0.25, x0 = 0.7, y0 = 3.0;
  topics.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = x0 + col * (cw + gx), y = y0 + row * (ch + gy);
    s.addShape("roundRect", { x, y, w: cw, h: ch, rectRadius: 0.08,
      fill: { color: C.card }, line: { color: C.border, width: 2 } });
    s.addText(t, { x: x + 0.15, y, w: cw - 0.3, h: ch, align: "center", valign: "middle",
      fontSize: 17, color: C.sub, fontFace: FONT });
  });
  s.addText("Q&Aは8〜10分ほど取ります", { x: 0.7, y: 6.4, w: 12, h: 0.5,
    fontSize: 16, color: C.muted, italic: true, fontFace: FONT });
  footer(s);
})();

// =====================================================================
// 48. 質問がなければ……（沈黙対策）
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
      fill: { color: C.card }, line: { color: C.border, width: 2 } });
    s.addShape("rect", { x: 1.0, y, w: 0.14, h: 0.92, fill: { color: q.c } });
    s.addText(q.t, { x: 1.4, y, w: 10.8, h: 0.92, valign: "middle",
      fontSize: 21, bold: true, color: C.white, fontFace: FONT });
    y += 1.07;
  });
  footer(s);
})();

if (N !== TOTAL) console.warn(`⚠ slide count ${N} != TOTAL ${TOTAL}`);
pptx.writeFile({ fileName: "build/career_talk_setagaya.pptx" }).then(f => {
  console.log("✅ wrote", f, "/ slides:", N);
});

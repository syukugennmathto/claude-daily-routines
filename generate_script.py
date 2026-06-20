#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
進路も分散してみませんか — 明治大学附属世田谷高校 高1 / 50分版 しゃべり台本
生成: python3 generate_script.py  ->  build/career_talk_setagaya_script.pdf
日本語グリフはIPAGothic（ipag.ttf）を埋め込み、文字化けを回避。
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
)
from reportlab.lib.styles import ParagraphStyle

FONT_PATH = "/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf"
pdfmetrics.registerFont(TTFont("IPAG", FONT_PATH))

NAVY = colors.HexColor("#14223A")
ORANGE = colors.HexColor("#C76A2E")
TEAL = colors.HexColor("#1F8E83")
GRAY = colors.HexColor("#555555")
LIGHT = colors.HexColor("#EFF2F6")
ACCENTBG = colors.HexColor("#FBEFE3")

styles = {
    "doc_title": ParagraphStyle("dt", fontName="IPAG", fontSize=20, leading=26,
                                textColor=NAVY, spaceAfter=2),
    "doc_sub": ParagraphStyle("ds", fontName="IPAG", fontSize=11, leading=16,
                              textColor=GRAY, spaceAfter=10),
    "sec": ParagraphStyle("sec", fontName="IPAG", fontSize=13.5, leading=18,
                          textColor=colors.white, spaceBefore=10, spaceAfter=6),
    "slide_head": ParagraphStyle("sh", fontName="IPAG", fontSize=12, leading=16,
                                 textColor=NAVY, spaceBefore=8, spaceAfter=2),
    "time": ParagraphStyle("tm", fontName="IPAG", fontSize=9.5, leading=13,
                           textColor=ORANGE),
    "body": ParagraphStyle("bd", fontName="IPAG", fontSize=10, leading=15.5,
                           textColor=colors.HexColor("#222222"), spaceAfter=3),
    "talk": ParagraphStyle("tk", fontName="IPAG", fontSize=10, leading=16,
                           textColor=colors.HexColor("#1a1a1a"), leftIndent=6),
    "note": ParagraphStyle("nt", fontName="IPAG", fontSize=9, leading=13.5,
                           textColor=TEAL, leftIndent=6),
}


def section_bar(text):
    t = Table([[Paragraph(text, styles["sec"])]], colWidths=[170 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NAVY),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return t


def slide_block(num, title, time_range, talk_lines, notes=None):
    """1スライド分のブロック（見出し+尺+しゃべり+運用メモ）"""
    elems = []
    head = Table(
        [[Paragraph(f'<b>S{num}　{title}</b>', styles["slide_head"]),
          Paragraph(f'⏱ {time_range}', styles["time"])]],
        colWidths=[130 * mm, 40 * mm])
    head.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCD3DD")),
    ]))
    elems.append(head)
    elems.append(Spacer(1, 2))
    for line in talk_lines:
        elems.append(Paragraph("「" + line + "」" if line and not line.startswith("（")
                               else line, styles["talk"]))
    if notes:
        rows = [[Paragraph("▶ " + n, styles["note"])] for n in notes]
        nt = Table(rows, colWidths=[170 * mm])
        nt.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), ACCENTBG),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        elems.append(Spacer(1, 2))
        elems.append(nt)
    elems.append(Spacer(1, 6))
    return elems


# ====================== 本文データ ======================
story = []
story.append(Paragraph("進路も分散してみませんか — しゃべり台本（50分版）", styles["doc_title"]))
story.append(Paragraph(
    "明治大学附属世田谷高校 / 高1（1クラス20〜30名） / 50分 × 2回｜"
    "主催：TAP（Fora経由）｜HDMI持参｜2026.7.9",
    styles["doc_sub"]))

intro = Table([[Paragraph(
    "<b>全体設計：</b>話す尺は約30分に圧縮し、ワーク（書く＋発表）とQ&Aで20分を埋める。"
    "高1向けに「受験直前の煽り」ではなく「これから3年間・大学4年間をどう使うか」に寄せる。"
    "内部進学が有力な層なので、分散＝レール否定にならないよう一言補う。",
    styles["body"])]], colWidths=[170 * mm])
intro.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), ACCENTBG),
    ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
story.append(intro)
story.append(Spacer(1, 8))

# ---- パート1：導入・自己紹介（約10分） ----
story.append(section_bar("PART 1　導入・自己紹介　（0:00 - 10:00）"))

story += slide_block(1, "集中と分散：働き方の考え方", "0:00 - 2:00", [
    "こんにちは、植元雅斗といいます。今日は「進路も分散してみませんか」という、ちょっと変わったタイトルで話します。",
    "いきなりですが、働き方には大きく2つの考え方があります。一つに全部を賭ける『集中』と、リスクも自分も分けておく『分散』。",
    "今日はこの『分散』という考え方を、進路の話に持ち込んでみたいと思っています。",
], notes=[
    "最初の30秒で『今日は1個だけ持ち帰ってくれればOK＝分散』と握る。",
    "高1相手なので、結論を先に置いて安心させる。",
])

story += slide_block(2, "進路も分散してみませんか（自己紹介・活動グリッド）", "2:00 - 5:30", [
    "まず自己紹介を。僕は本業でDellに勤めながら、カメラマン、教育イベント、小説や同人誌、ラジオの構成作家、コミケのスタッフ……と、けっこう色々やっています。",
    "ぱっと見『なんでこんなに色々やってるの？』と思いますよね。実はこれ全部、さっきの『分散』なんです。",
], notes=[
    "グリッドは一つずつ読まず、指差しで『この辺ぜんぶ』と流す。",
    "ここで笑いを1つ取れると後のワークが回りやすい。",
])

story += slide_block(3, "人生目標：3層構造", "5:30 - 8:00", [
    "色々やっているけど、軸は一つです。『人と人の間に場を作り、間をなくす』。",
    "活動は3層に分けています。①目標に直結するもの、②自分を拡張するもの、③生きるために必要な生存戦略。",
    "全部バラバラに見えて、実は役割が違うだけ。これが今日のキーワード『分散』のイメージです。",
])

story += slide_block(4, "学生時代のバイト/仕事歴", "8:00 - 10:00", [
    "この土台は、学生時代のバイトです。サンリオピューロランドのレジ、アーティストのラジオ番組の構成作家、コミケのスタッフ、インターン2社同時……。",
    "インターンは2社同時でやって、電車に2社分のPCを忘れるという伝説を作りました。この話は後でQ&Aで。",
], notes=[
    "写真を見せながらテンポよく。沈黙対策のネタ（PC/サンリオ）の伏線をここで張る。",
])

# ---- パート2：ワーク（約12分） ----
story.append(section_bar("PART 2　ワーク：書く＋発表　（10:00 - 22:00）"))

story += slide_block(5, "仕事に何を求めますか？？（問い）", "10:00 - 11:00", [
    "ここで一回みなさんに考えてもらいます。『仕事に何を求めますか？』。複数あってOKです。",
    "高1だと『仕事』はまだ遠いかもしれないので、『将来のやりたいこと』『部活や勉強』に置き換えてもらっても大丈夫です。",
])

story += slide_block(6, "★WORK① まず書いてみよう（2分）", "11:00 - 14:00", [
    "では2分間、書いてみましょう。給与・やりがい・成長・社会貢献・人間関係。この5つから大事だと思うものを選んで、『なぜ大事か』を一言。",
    "5つ以外でもOK。自由な時間、好きな人と働く、なんでも。正解はありません。",
], notes=[
    "紙が配れるなら紙、無理なら手元のノート/頭の中で。2分はタイマーで可視化。",
    "机間を回って、面白い回答を1〜2個ピックしておく（次の発表で指名するため）。",
    "『正解はない』を強調＝高1が安心して書ける空気を作る。",
])

story += slide_block(7, "★WORK② みんなのを見てみよう（発表）", "14:00 - 19:00", [
    "何人かに聞いてみます。どれを選んだ？　いくつ選んだ？　一番大事なのはどれで、その理由は？",
    "（数名指名）ありがとう。……ほら、答えが人によってバラバラですよね。それでいいんです。それが正解。",
    "全部を1つの場所で満たそうとすると苦しい。だから『分ける』という発想が出てきます。",
], notes=[
    "3〜5名に発表してもらう。最初は事前にピックした生徒を指名すると場が温まる。",
    "『正解はバラバラ＝多様性の肯定』を回収し、次の分散フレームへ橋渡し。",
    "時間が押したら発表は3名で切り上げ、Q&Aに尺を回す。",
])

# ---- パート3：分散の考え方（約12分） ----
story.append(section_bar("PART 3　分散という考え方　（19:00 - 31:00）"))

story += slide_block(8, "仕事に何を求めますか？？（5要素・答え合わせ）", "19:00 - 20:00", [
    "改めて整理すると、よく挙がるのはこの5つ。給与・やりがい・成長・社会貢献・人間関係。みんなの回答もだいたいこの中に入っていたと思います。",
])

story += slide_block(9, "全部満たせる仕事、見つかりますか？", "20:00 - 21:00", [
    "じゃあ質問。この5つを全部満たす、完璧な仕事って見つかると思いますか？",
    "（少し間をおいて）……どうでしょう。",
])

story += slide_block(10, "“すっごく”ムリムリだと思いました", "21:00 - 22:00", [
    "僕は『すっごくムリ』だと思いました。給料は高いけどやりがいがない、やりがいはあるけど食えない……だいたいどれかが欠ける。",
])

story += slide_block(11, "そこで（転換）", "22:00 - 22:30", [
    "そこで、発想を変えます。",
])

story += slide_block(12, "一つの仕事に「全部」を求めない：分散（+内部進学への一言）", "22:30 - 27:00", [
    "岡田斗司夫さんの考え方なんですが、一つの仕事に全部を求めない。お金はA、やりがいはB、人間関係はC……と分ける。",
    "僕の場合は、Dellでお金、まなびぱれっとでやりがい、カメラで成長、コミケで人間関係。一つがしんどくても、他で取り返せる。",
    "——ここで大事なこと。みなさんの多くは明治大学にそのまま上がる選択肢がありますよね。それは立派な選択です。レールを否定する話じゃない。",
    "そのうえで、『大学の4年間で“何を”分散させるか』を今から考えておくと、めちゃくちゃ強い。進学した先で何を増やすか、です。",
], notes=[
    "内部進学層が『進学するな』と受け取らないよう、必ずレール肯定→上乗せの順で話す。",
    "『今から考えておくと強い』で高1の“まだ時間がある”を武器に変える。",
])

# ---- パート4：進路へ接続（約9分） ----
story.append(section_bar("PART 4　進路へ：失敗はない　（27:00 - 38:00）"))

story += slide_block(13, "とにかく失敗が多かった", "27:00 - 29:30", [
    "なんでこの考えに至ったか。とにかく失敗が多かったからです。PC忘れる、大学を留年する、仕事で同じミスを繰り返す。",
    "一つに全部賭けていたら、たぶん心が折れていました。分けていたから立ち直れた。",
])

story += slide_block(14, "進路を「分散」しませんか（高1向け）", "29:30 - 33:00", [
    "だから提案です。進路も分散しませんか。『好き』は複数持っておいていい。今のうちに増やしておく。",
    "没頭できる物語は無数にある。燃え尽きるほど一点に賭けなくていい。",
    "高1のみなさんに一番言いたいのは、これからの3年間、そして大学の4年間を“どう使うか”。進路は『いつ決めるか』より『どう分散させておくか』です。",
], notes=[
    "受験テクの話はしない。『時間の使い方』に寄せると高1に刺さる。",
])

story += slide_block(15, "進路に「失敗」はない", "33:00 - 38:00", [
    "たくさん失敗した僕が言います。進路に『失敗』はありません。",
    "大学でも大学院でも専門でも就職でも、内部進学でも、『なぜその選択をしたか』を言えれば、それはもう立派な“自分の進路”です。",
    "理由さえあれば、普通じゃないルートでも全部アリ。これだけ覚えて帰ってください。",
], notes=[
    "ここが感情のピーク。ゆっくり、間を取って話す。",
])

# ---- パート5：Q&A（約12分） ----
story.append(section_bar("PART 5　Q&A　（38:00 - 50:00）"))

story += slide_block(16, "Q & A", "38:00 - 48:00", [
    "ここからは何でも聞いてください。内部進学ってどう？　大学の4年間どう使う？　好きの増やし方、副業の話、お金の話、失敗談のつづき……何でもOKです。",
], notes=[
    "Q&Aで10〜12分は確実に使う前提。最初の1問が出るまで7秒待つ（沈黙を恐れない）。",
    "1問に答えすぎない。30〜60秒で返してテンポを保つ。",
])

story += slide_block(17, "質問がなければ……（沈黙対策）", "（随時）", [
    "（質問が出ないとき、こちらから振る）",
    "留年したとき、親になんて言ったと思う？　サンリオのバイト、実際どうだった？　インターンのPC、どうやって取り返した？",
    "今の仕事、ぶっちゃけ給料いくらだと思う？　あと——みんな、高校の3年間、何に時間を使うか決めてる？",
], notes=[
    "この5問は鉄板の沈黙対策。1問投げて生徒に予想させてから答えると盛り上がる。",
    "最後は『高校3年間の使い方』を問いで投げ、本編メッセージに着地させて締める。",
])

# クロージング
close = Table([[Paragraph(
    "<b>締めの一言：</b>「今日のたった一つの持ち帰り。進路も、好きも、複数あっていい。"
    "明治に上がるなら、その4年で“何を分散させるか”を今から少しずつ。"
    "そして——進路に失敗はない。ありがとうございました。」",
    styles["body"])]], colWidths=[170 * mm])
close.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FCE9D6")),
    ("BOX", (0, 0), (-1, -1), 1, ORANGE),
    ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 4))
story.append(close)


# ====================== 出力 ======================
def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("IPAG", 8)
    canvas.setFillColor(GRAY)
    canvas.drawRightString(200 * mm, 10 * mm, f"進路も分散してみませんか（世田谷50分版）  -  {doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate("build/career_talk_setagaya_script.pdf", pagesize=A4,
                      leftMargin=20 * mm, rightMargin=20 * mm,
                      topMargin=16 * mm, bottomMargin=16 * mm)
frame = Frame(doc.leftMargin, doc.bottomMargin,
              doc.width, doc.height, id="main")
doc.addPageTemplates([PageTemplate(id="t", frames=[frame], onPage=footer)])
doc.build(story)
print("✅ wrote build/career_talk_setagaya_script.pdf")

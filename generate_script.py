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
story.append(Paragraph("進路も分散してみませんか — しゃべり台本（50分 / 35枚版）", styles["doc_title"]))
story.append(Paragraph(
    "明治大学附属世田谷高校 / 高1（1クラス20〜30名） / 50分 × 2回｜"
    "主催：TAP（Fora経由）｜HDMI持参｜2026.7.9",
    styles["doc_sub"]))

intro = Table([[Paragraph(
    "<b>全体設計：</b>本編を約40分でしっかり話し切り、Q&Aは「余裕枠」として10分確保（埋め草に依存しない）。"
    "高1向けに「受験直前の煽り」ではなく「これから3年間・大学4年間をどう使うか」に寄せる。"
    "内部進学が有力な層なので、分散＝レール否定にならないよう、レール肯定→上乗せの順で話す。",
    styles["body"])]], colWidths=[170 * mm])
intro.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), ACCENTBG),
    ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
story.append(intro)
story.append(Spacer(1, 8))

# ---- PART 1：導入・つかみ ----
story.append(section_bar("PART 1　導入・つかみ　（0:00 - 4:00）"))

story += slide_block(1, "表紙", "0:00 - 0:30", [
    "こんにちは、植元雅斗といいます。今日は「進路も分散してみませんか」という、ちょっと変わったタイトルで話します。",
], notes=["明るく短く。名前と「変なタイトルでしょ？」で軽くつかむ。"])

story += slide_block(2, "今日のゴール", "0:30 - 1:30", [
    "最初に言っておくと、今日は全部覚えなくて大丈夫です。持ち帰ってほしいのは、たった1つ。",
    "『進路も、好きも、複数あっていい』。これだけ覚えて帰ってくれたら、今日は大成功です。",
], notes=["結論を先に置いて安心させる＝高1向けの鉄則。"])

story += slide_block(3, "今日の流れ", "1:30 - 2:30", [
    "流れはこの4つ。まず自己紹介、次にみんなにちょっと書いてもらうワーク、それから『分散』という考え方、最後に進路の話とQ&Aです。",
])

story += slide_block(4, "アイスブレイク：もう決まってる人？", "2:30 - 4:00", [
    "いきなり質問。将来やりたいこと、もう決まってる人？　手を挙げてみてください。",
    "（数人に聞く）ありがとう。決まってなくて全然OKです。今日はむしろ『今は決めなくていい』という話をします。",
], notes=["挙手→2〜3人に軽く振る。沈黙でも『だよね、普通決まってない』で受ける。"])

# ---- PART 2：自己紹介 ----
story.append(section_bar("PART 2　自己紹介　（4:00 - 12:30）"))

story += slide_block(5, "集中と分散：働き方の考え方", "4:00 - 6:00", [
    "働き方には大きく2つあります。一つに全部を賭ける『集中』と、リスクも自分も分けておく『分散』。",
    "今日はこの『分散』を、進路の話に持ち込みます。まず、僕がどれだけ分散しているか見てください。",
])

story += slide_block(6, "活動グリッド（自己紹介）", "6:00 - 8:30", [
    "本業はDell。そのかたわら、カメラマン、教育イベント、小説や同人誌、ラジオの構成作家、コミケのスタッフ……色々やっています。",
    "『なんでこんなに色々やってるの？』と思いますよね。実はこれ全部、さっきの『分散』なんです。",
], notes=["一つずつ読まず指差しで流す。ここで笑いを1つ取れると後が楽。"])

story += slide_block(7, "人生目標：3層構造", "8:30 - 10:00", [
    "色々やってるけど、軸は1つ。『人と人の間に場を作り、間をなくす』。",
    "活動は3層に分けています。①目標に直結、②自分を拡張、③生きるための生存戦略。役割が違うだけなんです。",
])

story += slide_block(8, "ある1週間の使い方", "10:00 - 11:30", [
    "『分散』って具体的にどういうことか。僕のある1週間です。平日はDell、夜は執筆や開発、土曜はカメラや教育、日曜はコミケやラジオ。",
    "一人の中に、いくつもの顔がある。これが分散のイメージです。",
], notes=["『みんなも部活・勉強・趣味で既に分散してるよね』と橋渡しできる。"])

story += slide_block(9, "学生時代のバイト/仕事歴", "11:30 - 12:30", [
    "この土台は学生時代のバイト。サンリオのレジ、ラジオの構成作家、コミケのスタッフ、インターン2社同時。",
    "インターンは電車に2社分のPCを忘れる伝説を作りました。この話は後で。",
], notes=["沈黙対策ネタ（PC/サンリオ）の伏線をここで張る。"])

# ---- PART 3：ワーク ----
story.append(section_bar("PART 3　ワーク：書く＋発表　（12:30 - 20:00）"))

story += slide_block(10, "仕事に何を求めますか？？（問い）", "12:30 - 13:30", [
    "ここで考えてもらいます。『仕事に何を求めますか？』。複数あってOK。",
    "『仕事』が遠ければ、『将来やりたいこと』『部活や勉強』に置き換えても大丈夫です。",
])

story += slide_block(11, "★WORK① まず書いてみよう（2分）", "13:30 - 16:00", [
    "2分間、書いてみましょう。給与・やりがい・成長・社会貢献・人間関係。大事だと思うものを選んで、『なぜ大事か』を一言。",
    "5つ以外でもOK。自由な時間、好きな人と働く、なんでも。正解はありません。",
], notes=[
    "紙が配れれば紙、無理なら頭の中で。2分はタイマーで可視化。",
    "机間を回り、面白い回答を1〜2個ピック（次の指名用）。",
    "『正解はない』を強調＝安心して書ける空気づくり。",
])

story += slide_block(12, "★WORK② みんなのを見てみよう（発表）", "16:00 - 19:30", [
    "何人かに聞きます。どれを選んだ？　いくつ？　一番大事なのはどれで、その理由は？",
    "（3〜5名指名）ありがとう。ほら、答えがバラバラですよね。",
], notes=[
    "事前にピックした子を最初に指名すると場が温まる。",
    "押したら3名で切り上げてOK（後ろに余裕がある構成）。",
])

story += slide_block(13, "答えはバラバラでいい", "19:30 - 20:00", [
    "答えは人によってバラバラ。それでいいんです。",
    "でも、全部を『1つの仕事』で満たそうとすると、ちょっと苦しい。",
])

# ---- PART 4：分散という考え方 ----
story.append(section_bar("PART 4　分散という考え方　（20:00 - 33:00）"))

story += slide_block(14, "5要素（答え合わせ）", "20:00 - 20:45", [
    "よく挙がるのはこの5つ。給与・やりがい・成長・社会貢献・人間関係。みんなの回答もだいたいこの中だったはず。",
])

story += slide_block(15, "全部満たせる仕事、ある？", "20:45 - 21:30", [
    "じゃあ質問。この5つを全部満たす完璧な仕事、見つかると思いますか？（間をおく）",
])

story += slide_block(16, "“すっごく”ムリだと思った", "21:30 - 22:15", [
    "僕は『すっごくムリ』だと思いました。給料は高いけどやりがいがない、やりがいはあるけど食えない……だいたいどれか欠ける。",
])

story += slide_block(17, "そこで（転換）", "22:15 - 22:30", [
    "そこで、発想を変えます。",
])

story += slide_block(18, "「集中」のいいところ・しんどいところ", "22:30 - 24:00", [
    "まず集中。深く極められて突き抜けられる、これは強い。でも、コケたとき全部いっぺんに失うし、視野もせまくなりがち。",
])

story += slide_block(19, "「分散」のいいところ・しんどいところ", "24:00 - 25:30", [
    "分散はどうか。リスクが分かれる、違う活動が掛け算になる、無理がないから長く続く。弱点は、すぐには突き抜けないこと。",
    "どっちが正解でもない。でも『高校生の今』は、分散が向いていると思います。時間という最大の武器があるから。",
])

story += slide_block(20, "分散フレーム（岡田斗司夫）", "25:30 - 27:00", [
    "岡田斗司夫さんの考え方。一つの仕事に全部を求めない。お金はA、やりがいはB、人間関係はC……と分けて手に入れる。",
])

story += slide_block(21, "私の場合の分散", "27:00 - 28:00", [
    "僕だと、Dellでお金、まなびぱれっとでやりがい、カメラと執筆で成長、コミケで人間関係。",
    "一つがしんどくても、他で取り返せる。これがすごく効くんです。",
])

story += slide_block(22, "分散の誤解（器用貧乏では？）", "28:00 - 29:30", [
    "『分散ってただの器用貧乏では？』ってよく言われます。でも、こう考えています。",
    "突き抜ける人も最初はいろいろ試している。バラバラの経験はつながると武器になる。そして続けられる人が結局いちばん遠くへ行く。",
], notes=["高1が一番抱きそうな反論を先回りで潰すスライド。"])

story += slide_block(23, "分散は「掛け算」になる", "29:30 - 31:00", [
    "実際、僕のバラバラの好きはつながりました。カメラ×教育で教材撮影、小説×ラジオで構成作家、企画×コミュニティでイベント運営。",
    "分散は足し算じゃなくて掛け算。バラバラの好きが、ある日つながるんです。",
])

story += slide_block(24, "とにかく失敗が多かった", "31:00 - 33:00", [
    "なんでこの考えに至ったか。とにかく失敗が多かったからです。PCを忘れ、大学を留年し、仕事でも同じミスを繰り返した。",
], notes=["次の2枚で具体エピソードに入る前ふり。"])

# ---- PART 5：失敗と進路 ----
story.append(section_bar("PART 5　失敗、そして進路へ　（33:00 - 40:00）"))

story += slide_block(25, "失敗① インターンでPCを忘れた", "33:00 - 34:00", [
    "インターンを2社同時にやった結果——電車に2社分のPCを忘れました。頭が真っ白、会社にも平謝り。両立って、見た目以上に難しい。",
], notes=["どう取り返したかはQ&Aへ温存（沈黙対策ネタ）。"])

story += slide_block(26, "失敗② 大学を留年した", "34:00 - 35:00", [
    "色々やりすぎて単位を落とし、留年しました。学費は自分で払った。正直しんどかった。でも、終わりではなかったんです。",
])

story += slide_block(27, "でも、折れなかった", "35:00 - 36:00", [
    "一つコケても、他の活動が残っていたから折れなかった。",
    "『分散』は、心を守るセーフティネットにもなるんです。",
])

story += slide_block(28, "明治に上がる人へ（内部進学）", "36:00 - 37:30", [
    "ここで大事なこと。みなさんの多くは明治にそのまま上がれますよね。それは立派な選択。『分散しよう』はレールを否定する話じゃありません。",
    "その上で、『大学の4年間で“何を”分散させるか』を今から考えておくと、めちゃくちゃ強い。",
], notes=["必ずレール肯定→上乗せの順。『進学するな』に聞こえさせない。"])

story += slide_block(29, "大学の4年間で分散できること", "37:30 - 38:30", [
    "たとえば、専攻＋他学部の授業、サークル、長期インターン、留学、副業や起業、学外のコミュニティ。",
    "全部やらなくていい。種を『複数』まいておくだけでいいんです。",
])

story += slide_block(30, "進路を「分散」しませんか", "38:30 - 40:00", [
    "だから提案です。進路も分散しませんか。『好き』は複数持っていい。今のうちに増やしておく。",
    "一番言いたいのは、これからの3年間と大学の4年間を“どう使うか”。進路は『いつ決めるか』より『どう分散させておくか』です。",
], notes=["受験テクの話はしない。『時間の使い方』に寄せる。"])

# ---- PART 6：締め＆Q&A ----
story.append(section_bar("PART 6　締め ＆ Q&A　（40:00 - 50:00）"))

story += slide_block(31, "進路に「失敗」はない", "40:00 - 41:30", [
    "たくさん失敗した僕が言います。進路に『失敗』はありません。",
    "大学でも専門でも就職でも、内部進学でも、『なぜその選択をしたか』を言えれば、もう立派な“自分の進路”です。",
], notes=["感情のピーク。ゆっくり、間を取って。"])

story += slide_block(32, "高校3年間で今日からできること", "41:30 - 42:30", [
    "今日からできることを4つ。好きを3つ書き出す、やったことないことを1つ試す、教室の外に顔を出す、小さく発信する。",
    "大きく変えなくていい。種を増やすだけです。",
])

story += slide_block(33, "今日の持ち帰り（まとめ）", "42:30 - 43:30", [
    "まとめます。①進路も好きも複数あっていい。②明治に上がるなら、大学4年で何を分散させるか今から。③進路に失敗はない。",
    "この3つ、特に最初の1つだけでも持って帰ってください。",
])

story += slide_block(34, "Q & A", "43:30 - 49:30", [
    "ここからは何でも聞いてください。内部進学ってどう？　大学4年どう使う？　好きの増やし方、副業、お金の話、失敗談のつづき……何でもOK。",
], notes=[
    "余裕枠として約6分。最初の1問が出るまで7秒待つ（沈黙を恐れない）。",
    "1問は30〜60秒で返してテンポ維持。",
])

story += slide_block(35, "質問がなければ……（沈黙対策）", "（随時）", [
    "（質問が出ないとき、こちらから振る）",
    "留年したとき親になんて言ったと思う？　サンリオのバイト実際どうだった？　インターンのPCどう取り返した？",
    "今の仕事ぶっちゃけ給料いくら？　あと——みんな、高校の3年間、何に時間を使うか決めてる？",
], notes=[
    "鉄板の沈黙対策。1問投げて生徒に予想させてから答えると盛り上がる。",
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

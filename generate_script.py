#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
進路も分散してみませんか — 明治大学附属世田谷高校 高1 / 50分・48枚（2本柱）版 しゃべり台本
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
    "doc_title": ParagraphStyle("dt", fontName="IPAG", fontSize=20, leading=26, textColor=NAVY, spaceAfter=2),
    "doc_sub": ParagraphStyle("ds", fontName="IPAG", fontSize=11, leading=16, textColor=GRAY, spaceAfter=10),
    "sec": ParagraphStyle("sec", fontName="IPAG", fontSize=13.5, leading=18, textColor=colors.white, spaceBefore=10, spaceAfter=6),
    "slide_head": ParagraphStyle("sh", fontName="IPAG", fontSize=12, leading=16, textColor=NAVY, spaceBefore=8, spaceAfter=2),
    "time": ParagraphStyle("tm", fontName="IPAG", fontSize=9.5, leading=13, textColor=ORANGE),
    "body": ParagraphStyle("bd", fontName="IPAG", fontSize=10, leading=15.5, textColor=colors.HexColor("#222222"), spaceAfter=3),
    "talk": ParagraphStyle("tk", fontName="IPAG", fontSize=10, leading=16, textColor=colors.HexColor("#1a1a1a"), leftIndent=6),
    "note": ParagraphStyle("nt", fontName="IPAG", fontSize=9, leading=13.5, textColor=TEAL, leftIndent=6),
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
    elems = []
    head = Table(
        [[Paragraph(f'<b>S{num}　{title}</b>', styles["slide_head"]),
          Paragraph(f'⏱ {time_range}', styles["time"])]],
        colWidths=[130 * mm, 40 * mm])
    head.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 3), ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
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
            ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        elems.append(Spacer(1, 2))
        elems.append(nt)
    elems.append(Spacer(1, 6))
    return elems


# ====================== 本文データ ======================
story = []
story.append(Paragraph("進路も分散してみませんか — しゃべり台本（50分 / 48枚・2本柱版）", styles["doc_title"]))
story.append(Paragraph(
    "明治大学附属世田谷高校 / 高1（1クラス20〜30名） / 50分 × 2回｜主催：TAP（Fora経由）｜HDMI持参｜2026.7.9",
    styles["doc_sub"]))

intro = Table([[Paragraph(
    "<b>全体設計：</b>柱を2本に。柱①「分散」（好きを複数持つ）→ 柱②「場をつくる」（客をやめて、つくる側に回る）。"
    "締めは <b>分散しよう → つくる側に回ろう → だから進路に失敗はない</b> の3段で、最後は人生目標"
    "「人と人の間に場を作り、間をなくす」に着地。本編を約42分で話し切り、Q&Aは8分前後を確保。",
    styles["body"])]], colWidths=[170 * mm])
intro.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), ACCENTBG),
    ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
story.append(intro)
story.append(Spacer(1, 8))

# ---- PART 1：導入 ----
story.append(section_bar("PART 1　導入・つかみ　（0:00 - 4:00）"))
story += slide_block(1, "表紙", "0:00 - 0:30", [
    "こんにちは、植元雅斗です。今日は「進路も分散してみませんか」という、ちょっと変わったタイトルで話します。",
], notes=["明るく短く。「変なタイトルでしょ？」で軽くつかむ。"])
story += slide_block(2, "今日のゴール", "0:30 - 1:30", [
    "今日は全部覚えなくて大丈夫。持ち帰ってほしいのは2つだけ。『分散しよう』と『つくる側に回ろう』。これだけで大成功です。",
], notes=["前回までは“1つ”だったが、今回は柱が2本なので“2つ”に。"])
story += slide_block(3, "今日の流れ", "1:30 - 2:30", [
    "流れは4つ。自己紹介、ちょっとしたワーク、今日のメインの『2つの柱』、最後に進路の話とQ&Aです。",
])
story += slide_block(4, "アイスブレイク：もう決まってる人？", "2:30 - 4:00", [
    "いきなり質問。将来やりたいこと、もう決まってる人？　手を挙げて。",
    "（数人に聞く）決まってなくて全然OK。今日はむしろ『今は決めなくていい』話をします。",
], notes=["挙手→2〜3人。沈黙でも『だよね』で受ける。"])

# ---- PART 2：自己紹介 ----
story.append(section_bar("PART 2　自己紹介　（4:00 - 11:00）"))
story += slide_block(5, "集中と分散：働き方の考え方", "4:00 - 5:30", [
    "働き方には2つある。全部を賭ける『集中』と、分けておく『分散』。今日はこの分散を進路に持ち込みます。",
])
story += slide_block(6, "活動グリッド（自己紹介）", "5:30 - 7:30", [
    "本業はDell。そのかたわらカメラマン、教育イベント、小説、ラジオ構成、コミケのスタッフ……色々やっています。",
    "『なんでこんなに？』と思いますよね。これ全部、分散なんです。",
], notes=["指差しで流す。笑いを1つ取れると後が楽。"])
story += slide_block(7, "人生目標：3層構造", "7:30 - 9:00", [
    "軸は1つ。『人と人の間に場を作り、間をなくす』。一番上にある『場を作る』、これ後半の伏線です。覚えておいてください。",
], notes=["“場を作る”を強調＝柱②への布石。"])
story += slide_block(8, "ある1週間の使い方", "9:00 - 10:00", [
    "分散の具体イメージ。平日はDell、夜は執筆や開発、土曜はカメラや教育、日曜はコミケやラジオ。一人の中に、いくつもの顔がある。",
])
story += slide_block(9, "学生時代のバイト/仕事歴", "10:00 - 11:00", [
    "土台は学生時代のバイト。サンリオのレジ、ラジオ構成、コミケのスタッフ、インターン2社同時。",
    "インターンは電車に2社分のPCを忘れる伝説を作りました。この話は後で。",
], notes=["沈黙対策ネタ（PC/サンリオ）の伏線。"])

# ---- PART 3：ワーク ----
story.append(section_bar("PART 3　ワーク：書く＋発表　（11:00 - 17:30）"))
story += slide_block(10, "仕事に何を求めますか？？（問い）", "11:00 - 12:00", [
    "考えてもらいます。『仕事に何を求める？』複数OK。『将来やりたいこと』『部活や勉強』に置き換えてもOK。",
])
story += slide_block(11, "★WORK① まず書いてみよう（2分）", "12:00 - 14:30", [
    "2分で書いてみよう。給与・やりがい・成長・社会貢献・人間関係。大事なものを選んで『なぜ』を一言。5つ以外でもOK。正解はありません。",
], notes=["2分はタイマー可視化。机間を回り、面白い回答をピック（指名用）。"])
story += slide_block(12, "★WORK② みんなのを見てみよう（発表）", "14:30 - 17:00", [
    "何人かに聞きます。どれを選んだ？　一番大事なのは？　その理由は？",
    "（3〜5名指名）ありがとう。ほら、答えがバラバラですよね。",
], notes=["事前ピックの子から指名。押したら3名で切り上げOK。"])
story += slide_block(13, "答えはバラバラでいい", "17:00 - 17:30", [
    "答えはバラバラ、それでいい。でも全部を1つの仕事で満たそうとすると苦しい。",
])

# ---- PART 4：柱① 分散 ----
story.append(section_bar("PART 4　柱① 分散　（17:30 - 28:30）"))
story += slide_block(14, "〔章扉〕柱① 分散", "17:30 - 17:45", [
    "ここからが1つ目の柱。『分散』です。",
])
story += slide_block(15, "5要素（答え合わせ）", "17:45 - 18:30", [
    "よく挙がるのはこの5つ。給与・やりがい・成長・社会貢献・人間関係。みんなの回答もだいたいこの中だったはず。",
])
story += slide_block(16, "全部満たせる仕事、ある？", "18:30 - 19:15", [
    "じゃあ質問。この5つ全部を満たす完璧な仕事、見つかると思う？（間）",
])
story += slide_block(17, "“すっごく”ムリだと思った", "19:15 - 20:00", [
    "僕は『すっごくムリ』だと思った。給料は高いけどやりがいがない……だいたいどれか欠ける。",
])
story += slide_block(18, "そこで（転換）", "20:00 - 20:15", ["そこで、発想を変えます。"])
story += slide_block(19, "「集中」のいいところ・しんどいところ", "20:15 - 21:45", [
    "集中は、深く極められて突き抜けられる。でもコケたとき全部失うし、視野もせまくなりがち。",
])
story += slide_block(20, "「分散」のいいところ・しんどいところ", "21:45 - 23:15", [
    "分散は、リスクが分かれて掛け算が生まれ、長く続く。弱点はすぐ突き抜けないこと。",
    "どっちが正解でもない。でも『高校生の今』は分散が向いている。時間という武器があるから。",
])
story += slide_block(21, "分散フレーム（岡田斗司夫）", "23:15 - 24:30", [
    "岡田斗司夫さんの考え方。一つの仕事に全部を求めない。お金はA、やりがいはB……と分けて手に入れる。",
])
story += slide_block(22, "私の場合の分散", "24:30 - 25:30", [
    "僕だと、Dellでお金、まなびぱれっとでやりがい、カメラと執筆で成長、コミケで人間関係。一つがしんどくても他で取り返せる。",
])
story += slide_block(23, "分散の誤解（器用貧乏では？）", "25:30 - 27:00", [
    "『分散ってただの器用貧乏では？』ってよく言われる。でも、突き抜ける人も最初はいろいろ試している。",
    "バラバラの経験はつながると武器になる。そして続けられる人が結局いちばん遠くへ行く。",
], notes=["高1が抱きそうな反論を先回りで潰す。"])
story += slide_block(24, "分散は「掛け算」になる", "27:00 - 28:30", [
    "実際、僕のバラバラの好きはつながった。カメラ×教育で教材撮影、小説×ラジオで構成作家、企画×コミュニティでイベント運営。",
    "分散は足し算じゃなく掛け算。バラバラの好きが、ある日つながる。",
])

# ---- PART 5：失敗 ----
story.append(section_bar("PART 5　失敗、そして……　（28:30 - 31:30）"))
story += slide_block(25, "とにかく失敗が多かった", "28:30 - 29:00", [
    "なんでこの考えに至ったか。とにかく失敗が多かったから。PCを忘れ、留年し、同じミスを繰り返した。",
])
story += slide_block(26, "失敗① インターンでPCを忘れた", "29:00 - 29:45", [
    "2社同時にやった結果、電車に2社分のPCを忘れた。頭が真っ白、平謝り。両立って見た目以上に難しい。",
], notes=["取り返し方はQ&Aへ温存。"])
story += slide_block(27, "失敗② 大学を留年した", "29:45 - 30:30", [
    "色々やりすぎて単位を落とし、留年。学費は自分で払った。しんどかった。でも、終わりじゃなかった。",
])
story += slide_block(28, "でも、折れなかった", "30:30 - 31:30", [
    "一つコケても、他の活動が残っていたから折れなかった。分散は、心を守るセーフティネットにもなる。",
])

# ---- PART 6：内部進学・進路 ----
story.append(section_bar("PART 6　内部進学と進路　（31:30 - 34:00）"))
story += slide_block(29, "明治に上がる人へ（内部進学）", "31:30 - 33:00", [
    "大事なこと。みなさんの多くは明治にそのまま上がれますよね。それは立派な選択。『分散しよう』はレールを否定する話じゃない。",
    "その上で『大学の4年間で“何を”分散させるか』を今から考えておくと、めちゃくちゃ強い。",
], notes=["必ずレール肯定→上乗せの順。『進学するな』に聞こえさせない。"])
story += slide_block(30, "大学の4年間で分散できること", "33:00 - 33:30", [
    "専攻＋他学部、サークル、長期インターン、留学、副業や起業、学外コミュニティ。全部やらなくていい、種を複数まくだけ。",
])
story += slide_block(31, "進路を「分散」しませんか", "33:30 - 34:00", [
    "だから提案。進路も分散しよう。好きは複数持っていい。一番言いたいのは、3年間と大学4年間を“どう使うか”。",
    "……でも、分散には、もう一つ大事な相棒がいます。",
], notes=["ここで柱②へブリッジ。"])

# ---- PART 7：柱② 場をつくる ----
story.append(section_bar("PART 7　柱② 場をつくる　（34:00 - 41:00）"))
story += slide_block(32, "〔章扉〕柱② 場をつくる", "34:00 - 34:15", [
    "もう一つの柱。それが『場をつくる』です。",
])
story += slide_block(33, "★もう一つだけ。「客」をやめてみる", "34:15 - 35:30", [
    "イベントも部活も教室も、参加する『だけ』じゃなく、つくる側・運営側に一回立ってみてほしい。見える景色が180°変わる。",
    "文化祭、お客さんで回るのと企画する側、どっちが記憶に残る？　たぶん、つくった側ですよね。",
], notes=["★追加スライドの核①。体験を問いかけで自分ごと化。"])
story += slide_block(34, "そもそも「場」って？", "35:30 - 36:15", [
    "『場』って大げさなものじゃない。人が集まって何かが生まれるところ。教室も、部活も、LINEグループも、この講話も場。2人集まればもう場です。",
])
story += slide_block(35, "「客」と「つくる側」、何が違う？", "36:15 - 37:00", [
    "客のままだと、受け取るだけで記憶に残りにくい。つくる側に回ると、自分ごとになって濃い経験が残り、人とつながる。一回でいいから立ってみて。",
])
story += slide_block(36, "僕がつくってきた「場」", "37:00 - 38:00", [
    "僕の場。コミケの更衣室担当、まなびハウス、企画から運転までやったバス旅行、そして今日のこの講話。",
    "バラバラに見える活動、実は全部『場づくり』だったんです。",
])
story += slide_block(37, "場は、小さくていい", "38:00 - 38:45", [
    "場は小さくていい。友だち2人の勉強会、好きな人を集めた撮影会、クラスの小さな企画。いきなり大きくしなくていい。",
])
story += slide_block(38, "つくる側で、人とつながれた", "38:45 - 39:30", [
    "参加者から運営に回った瞬間、急に人とつながれた。バラバラだった僕の活動が、場を通して人とつながっていったんです。",
])
story += slide_block(39, "★場をつくると、人との「間」がなくなる", "39:30 - 40:15", [
    "自分の場を持つと、そこに人が集まる。分散していたバラバラの点が、場を通してつながる。",
    "分散 × 場づくり。これが、僕の生き方です。そういえば、僕の人生目標は……（後で回収）。",
], notes=["★追加スライドの核②。人生目標へのコールバック。"])
story += slide_block(40, "点が、場を通して「線」になる", "40:15 - 40:45", [
    "図にするとこう。バラバラの点（分散）が、真ん中の『場』を通して、線でつながる。これが分散×場づくりの形です。",
])
story += slide_block(41, "高校でできる「場づくり」の一歩", "40:45 - 41:00", [
    "高校でも今からできる。文化祭の実行委員、部活で新企画、小さな集まりを主催、SNSで発信。一回でいい、客からつくる側へ。",
])

# ---- PART 8：締め（3段クロージング） ----
story.append(section_bar("PART 8　締め：分散 → 場づくり → 失敗はない　（41:00 - 43:30）"))
story += slide_block(42, "おさらい：2つの柱", "41:00 - 41:30", [
    "おさらい。柱①分散＝好きを複数持つ。柱②場をつくる＝客をやめてつくる側に回る。この2本で、進路の話に戻ります。",
])
story += slide_block(43, "進路に「失敗」はない", "41:30 - 42:30", [
    "たくさん失敗した僕が言います。進路に『失敗』はありません。",
    "大学でも専門でも就職でも、内部進学でも、『なぜその選択をしたか』を言えれば、もう立派な“自分の進路”です。",
], notes=["感情のピーク。ゆっくり、間を取って。"])
story += slide_block(44, "高校生活で今日からできること", "42:30 - 43:00", [
    "今日からできること。好きを3つ書く、未経験を1つ試す（分散）。一度つくる側に立つ、小さく発信する（場づくり）。種を増やすだけ。",
])
story += slide_block(45, "今日の持ち帰り（3点）", "43:00 - 43:15", [
    "まとめ。①進路も好きも複数あっていい。②客をやめて、つくる側に回る。③進路に失敗はない。",
])
story += slide_block(46, "人生目標で締め（着地）", "43:15 - 43:30", [
    "最後にもう一度。僕の人生目標は『人と人の間に場を作り、間をなくす』。",
    "今日の話はぜんぶここにつながっています。分散して、場をつくる。それが僕の生き方。ありがとうございました。",
], notes=["伏線（S7）を回収して着地。拍手のタイミング。"])

# ---- PART 9：Q&A ----
story.append(section_bar("PART 9　Q&A　（43:30 - 50:00）"))
story += slide_block(47, "Q & A", "43:30 - 49:30", [
    "ここからは何でも。内部進学ってどう？　大学4年どう使う？　場のつくり方、副業、お金、失敗談のつづき……何でもOK。",
], notes=[
    "余裕枠として約6分。最初の1問が出るまで7秒待つ（沈黙を恐れない）。",
    "1問は30〜60秒で返してテンポ維持。",
])
story += slide_block(48, "質問がなければ……（沈黙対策）", "（随時）", [
    "（質問が出ないとき、こちらから振る）",
    "留年したとき親になんて言ったと思う？　サンリオのバイト実際どうだった？　インターンのPCどう取り返した？",
    "今の仕事ぶっちゃけ給料いくら？　あと——みんな、高校の3年間、何に時間を使うか決めてる？",
], notes=[
    "鉄板の沈黙対策。1問投げて生徒に予想させてから答えると盛り上がる。",
    "最後は『場をつくる側に回ってみて』で締めると本編に着地する。",
])


# ====================== 出力 ======================
def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("IPAG", 8)
    canvas.setFillColor(GRAY)
    canvas.drawRightString(200 * mm, 10 * mm, f"進路も分散してみませんか（世田谷50分・2本柱版）  -  {doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate("build/career_talk_setagaya_script.pdf", pagesize=A4,
                      leftMargin=20 * mm, rightMargin=20 * mm,
                      topMargin=16 * mm, bottomMargin=16 * mm)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
doc.addPageTemplates([PageTemplate(id="t", frames=[frame], onPage=footer)])
doc.build(story)
print("✅ wrote build/career_talk_setagaya_script.pdf")

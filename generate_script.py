#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
進路も分散してみませんか — 明治大学附属世田谷高校 高1 / 50分・53枚（2本柱＋職業観）版 しゃべり台本
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
story.append(Paragraph("進路も分散してみませんか — しゃべり台本（50分 / 53枚・2本柱＋職業観版）", styles["doc_title"]))
story.append(Paragraph(
    "明治大学附属世田谷高校 / 高1（1クラス20〜30名・IT志望多め） / 50分 × 2回｜主催：TAP（Fora経由）｜HDMI持参｜2026.7.9",
    styles["doc_sub"]))

intro = Table([[Paragraph(
    "<b>今回の改訂：</b>学校リクエストに対応。①本業 <b>Dell（エンタープライズIT）の職業観</b>を5枚追加（仕事内容／必要スキル"
    "／向いている人材）。②IT志望クラス向けに <b>数学 × IT × 暗号（PQC）</b>のバックボーンを接続。③プロジェクター視認性のため"
    "<b>フォント大・線太・高コントラスト配色</b>（濃紺背景に対し二次テキスト/青系を明るく）に調整。"
    "<br/><b>構成：</b>柱①分散 → 柱②場をつくる → 3段の締め（分散→つくる側→失敗はない）→人生目標に着地。",
    styles["body"])]], colWidths=[170 * mm])
intro.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), ACCENTBG),
    ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
story.append(intro)

tnote = Table([[Paragraph(
    "<b>時間が押したら：</b>S42「場は小さくていい」／S45「点が線になる図」／S49「今日からできること」は"
    "10秒で流す or 割愛可。まず本編を締めS51まで到達させ、Q&Aを最低3分は残す。",
    styles["body"])]], colWidths=[170 * mm])
tnote.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EDF5F3")),
    ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 4))
story.append(tnote)
story.append(Spacer(1, 8))

# ---- PART 1：導入 ----
story.append(section_bar("PART 1　導入・つかみ　（0:00 - 3:30）"))
story += slide_block(1, "表紙", "0:00 - 0:30", [
    "こんにちは、植元雅斗です。今日は「進路も分散してみませんか」という、ちょっと変わったタイトルで話します。",
], notes=["明るく短く。「変なタイトルでしょ？」で軽くつかむ。"])
story += slide_block(2, "今日のゴール", "0:30 - 1:15", [
    "全部覚えなくて大丈夫。持ち帰ってほしいのは2つだけ。『分散しよう』と『つくる側に回ろう』。これだけで大成功。",
])
story += slide_block(3, "今日の流れ", "1:15 - 2:00", [
    "流れは4つ。自己紹介、ワーク、今日のメインの『2つの柱』、最後に進路の話とQ&A。",
])
story += slide_block(4, "アイスブレイク：もう決まってる人？", "2:00 - 3:30", [
    "いきなり質問。将来やりたいこと、もう決まってる人？　手を挙げて。",
    "（数人に聞く）決まってなくてOK。今日はむしろ『今は決めなくていい』話をします。",
], notes=["挙手→2〜3人。IT・エンジニア志望が多いはずなので『IT系ねらってる人？』も足すと後半に効く。"])

# ---- PART 2：自己紹介 ----
story.append(section_bar("PART 2　自己紹介　（3:30 - 9:30）"))
story += slide_block(5, "集中と分散：働き方の考え方", "3:30 - 4:45", [
    "働き方には2つある。全部を賭ける『集中』と、分けておく『分散』。今日はこの分散を進路に持ち込みます。",
])
story += slide_block(6, "活動グリッド（自己紹介）", "4:45 - 6:15", [
    "本業はDell。かたわらで数学YouTube、ポスト量子暗号の実装、カメラ、教育、小説・同人誌、コミケのスタッフ……色々やっています。",
    "『なんでこんなに？』と思いますよね。これ全部、分散なんです。",
], notes=["IT・数学ワードをここで先出しし、IT志望の子の耳を立てる。"])
story += slide_block(7, "人生目標：3層構造", "6:15 - 7:30", [
    "軸は1つ。『人と人の間に場を作り、間をなくす』。一番上の『場を作る』、これ後半の伏線です。覚えておいて。",
])
story += slide_block(8, "ある1週間の使い方", "7:30 - 8:30", [
    "分散の具体イメージ。平日はDell、夜は開発や執筆、土日はカメラや教育、コミケ。一人の中に、いくつもの顔がある。",
])
story += slide_block(9, "学生時代のバイト/仕事歴", "8:30 - 9:30", [
    "土台は学生時代のバイト。サンリオのレジ、ラジオ構成、コミケのスタッフ、インターン2社同時で電車にPCを忘れる伝説も。",
], notes=["沈黙対策ネタ（PC/サンリオ）の伏線。ここから本業の中身に入る。"])

# ---- PART 3：★職業観（Dell / IT） ----
story.append(section_bar("★ PART 3　職業観：本業のリアル（Dell / IT）　（9:30 - 15:00）  ※学校リクエスト対応"))
story += slide_block(10, "本業のリアル：Dellってどんな仕事？", "9:30 - 10:30", [
    "本業をちゃんと話します。Dellはパソコンで有名だけど、僕がいるのは『企業向けのデータ基盤＝ストレージ』の部門。",
    "銀行・病院・工場・ゲーム会社……あらゆる企業の大事なデータを、止めずに守る“縁の下の力持ち”です。",
], notes=["スマホやゲームの裏に“見えないIT”がいる、と実感させる。IT志望に効くつかみ。"])
story += slide_block(11, "私のDellでの仕事内容", "10:30 - 11:45", [
    "僕の役割を一言でいうと『世界中の企業のITを、止めずに新しくする調整役』。",
    "顧客企業と日程を調整し、作業指示を管理し、アジア太平洋チームと英語でやりとりし、Salesforceで案件を回す。派手じゃないけど、止まると社会が困る仕事です。",
], notes=["職業観の核①＝“仕事内容”。具体語（ワークオーダー/APJC/SFDC）は雰囲気でOK、噛み砕いて。"])
story += slide_block(12, "この仕事に必要なスキル", "11:45 - 13:00", [
    "必要なスキルは5つ。段取り力と正確さ、調整・コミュニケーション、英語、ITインフラの基礎知識、そして学び続ける力。",
    "意外かもだけど『頭のよさ』より『正確に段取りできること』が効く世界です。",
], notes=["職業観の核②＝“必要スキル”。英語は完璧じゃなくていい、と補足すると安心する。"])
story += slide_block(13, "向いている人・この仕事の面白さ", "13:00 - 14:00", [
    "向いてるのは、コツコツ正確にやれる人、裏方で支えるのが好きな人、人との調整が苦じゃない人。",
    "面白さは、世界的な企業のインフラを支える誇り。主役じゃなくても、世界を動かせる仕事があるんです。",
], notes=["職業観の核③＝“向いている人材”。『目立たない仕事＝価値が低い』ではないと伝える。"])
story += slide_block(14, "★IT志望のキミへ：数学 × IT × 暗号", "14:00 - 15:00", [
    "ここ、IT系を目指してる人に特に聞いてほしい。僕のIT人生は『数学』から始まりました。中央大、都立大の院で数学専攻。",
    "その数学が今のITに全部つながってる。量子でも破れない暗号をJuliaで実装したり、YouTubeや同人誌で発信したり、Next.jsでアプリを作ったり。",
    "IT＝コードだけじゃない。数学も英語も“伝える力”も、全部つながって武器になる。これが次の『分散』の話にもつながります。",
], notes=["IT志望クラス向けの目玉スライド。専門用語は“こういう世界がある”レベルで。分散(掛け算)への橋渡し。"])

# ---- PART 4：ワーク ----
story.append(section_bar("PART 4　ワーク：書く＋発表　（15:00 - 20:30）"))
story += slide_block(15, "仕事に何を求めますか？？（問い）", "15:00 - 15:45", [
    "さっきの本業も踏まえて考えてみて。『仕事に何を求める？』複数OK。『将来やりたいこと』に置き換えてもOK。",
])
story += slide_block(16, "★WORK① まず書いてみよう（2分）", "15:45 - 18:00", [
    "2分で書いてみよう。給与・やりがい・成長・社会貢献・人間関係。大事なものを選んで『なぜ』を一言。5つ以外でもOK。",
], notes=["タイマー可視化。机間巡視で面白い回答をピック（指名用）。"])
story += slide_block(17, "★WORK② みんなのを見てみよう（発表）", "18:00 - 20:00", [
    "何人かに聞きます。どれを選んだ？　一番大事なのは？　その理由は？",
    "（3〜5名指名）ありがとう。ほら、答えがバラバラですよね。",
], notes=["事前ピックの子から指名。3名で切り上げOK。"])
story += slide_block(18, "答えはバラバラでいい", "20:00 - 20:30", [
    "答えはバラバラ、それでいい。でも全部を1つの仕事で満たそうとすると苦しい。",
])

# ---- PART 5：柱① 分散 ----
story.append(section_bar("PART 5　柱① 分散　（20:30 - 30:00）"))
story += slide_block(19, "〔章扉〕柱① 分散", "20:30 - 20:45", ["ここからが1つ目の柱。『分散』です。"])
story += slide_block(20, "5要素（答え合わせ）", "20:45 - 21:15", [
    "よく挙がるのはこの5つ。給与・やりがい・成長・社会貢献・人間関係。みんなの回答もだいたいこの中だったはず。",
])
story += slide_block(21, "全部満たせる仕事、ある？", "21:15 - 21:45", [
    "じゃあ質問。この5つ全部を満たす完璧な仕事、見つかると思う？（間）",
])
story += slide_block(22, "“すっごく”ムリだと思った", "21:45 - 22:15", [
    "僕は『すっごくムリ』だと思った。給料は高いけどやりがいがない……だいたいどれか欠ける。",
])
story += slide_block(23, "そこで（転換）", "22:15 - 22:25", ["そこで、発想を変えます。"])
story += slide_block(24, "「集中」のいいところ・しんどいところ", "22:25 - 23:40", [
    "集中は、深く極められて突き抜けられる。でもコケたとき全部失うし、視野もせまくなりがち。",
])
story += slide_block(25, "「分散」のいいところ・しんどいところ", "23:40 - 25:00", [
    "分散は、リスクが分かれて掛け算が生まれ、長く続く。弱点はすぐ突き抜けないこと。",
    "『高校生の今』は分散が向いている。時間という武器があるから。",
])
story += slide_block(26, "分散フレーム（岡田斗司夫）", "25:00 - 26:00", [
    "一つの仕事に全部を求めない。お金はA、やりがいはB……と分けて手に入れる、という考え方。",
])
story += slide_block(27, "私の場合の分散", "26:00 - 26:45", [
    "僕だと、Dellでお金、まなびぱれっとでやりがい、カメラや執筆で成長、コミケで人間関係。一つがしんどくても他で取り返せる。",
])
story += slide_block(28, "分散の誤解（器用貧乏では？）", "26:45 - 28:15", [
    "『分散ってただの器用貧乏では？』ってよく言われる。でも突き抜ける人も最初はいろいろ試している。",
    "バラバラの経験はつながると武器になる。続けられる人が、結局いちばん遠くへ行く。",
])
story += slide_block(29, "分散は「掛け算」になる", "28:15 - 30:00", [
    "実際つながった。数学×プログラミングで暗号の実装、カメラ×教育で教材撮影、企画×コミュニティでイベント運営。",
    "分散は足し算じゃなく掛け算。さっきの数学×ITの話も、まさにこれ。バラバラの好きが、ある日つながる。",
], notes=["S14（数学×IT）を回収。IT志望の子に『分散＝掛け算』が刺さる瞬間。"])

# ---- PART 6：失敗 ----
story.append(section_bar("PART 6　失敗、そして……　（30:00 - 32:30）"))
story += slide_block(30, "とにかく失敗が多かった", "30:00 - 30:30", [
    "なんでこの考えに至ったか。とにかく失敗が多かったから。PCを忘れ、留年し、同じミスを繰り返した。",
])
story += slide_block(31, "失敗① インターンでPCを忘れた", "30:30 - 31:15", [
    "2社同時にやった結果、電車に2社分のPCを忘れた。頭が真っ白、平謝り。両立って見た目以上に難しい。",
], notes=["取り返し方はQ&Aへ温存。"])
story += slide_block(32, "失敗② 大学を留年した", "31:15 - 31:55", [
    "色々やりすぎて単位を落とし、留年。学費は自分で払った。しんどかった。でも、終わりじゃなかった。",
])
story += slide_block(33, "でも、折れなかった", "31:55 - 32:30", [
    "一つコケても、他の活動が残っていたから折れなかった。分散は、心を守るセーフティネットにもなる。",
])

# ---- PART 7：内部進学・進路 ----
story.append(section_bar("PART 7　内部進学と進路　（32:30 - 34:30）"))
story += slide_block(34, "明治に上がる人へ（内部進学）", "32:30 - 33:45", [
    "大事なこと。みなさんの多くは明治にそのまま上がれますよね。それは立派な選択。『分散しよう』はレールを否定する話じゃない。",
    "その上で『大学の4年間で“何を”分散させるか』を今から考えておくと、めちゃくちゃ強い。",
], notes=["必ずレール肯定→上乗せの順。"])
story += slide_block(35, "大学の4年間で分散できること", "33:45 - 34:10", [
    "専攻＋他学部、サークル、長期インターン、留学、副業や起業、学外コミュニティ。全部やらなくていい、種を複数まくだけ。",
])
story += slide_block(36, "進路を「分散」しませんか", "34:10 - 34:30", [
    "だから提案。進路も分散しよう。好きは複数持っていい。……でも、分散にはもう一つ大事な相棒がいます。",
], notes=["柱②へブリッジ。"])

# ---- PART 8：柱② 場をつくる ----
story.append(section_bar("PART 8　柱② 場をつくる　（34:30 - 41:30）"))
story += slide_block(37, "〔章扉〕柱② 場をつくる", "34:30 - 34:45", ["もう一つの柱。『場をつくる』です。"])
story += slide_block(38, "★もう一つだけ。「客」をやめてみる", "34:45 - 35:45", [
    "イベントも部活も教室も、参加する『だけ』じゃなく、つくる側・運営側に一回立ってみて。見える景色が180°変わる。",
    "文化祭、お客さんで回るのと企画する側、どっちが記憶に残る？",
], notes=["★核①。問いかけで自分ごと化。"])
story += slide_block(39, "そもそも「場」って？", "35:45 - 36:25", [
    "『場』は大げさなものじゃない。人が集まって何かが生まれるところ。教室も、LINEグループも、この講話も場。2人集まればもう場。",
])
story += slide_block(40, "「客」と「つくる側」、何が違う？", "36:25 - 37:10", [
    "客のままだと受け取るだけで記憶に残りにくい。つくる側に回ると自分ごとになり、濃い経験が残り、人とつながる。",
])
story += slide_block(41, "僕がつくってきた「場」", "37:10 - 38:00", [
    "僕の場。コミケの更衣室担当、まなびハウス、企画から運転までやったバス旅行、そして今日のこの講話。全部『場づくり』でした。",
])
story += slide_block(42, "場は、小さくていい", "38:00 - 38:35", [
    "場は小さくていい。友だち2人の勉強会、好きな人を集めた撮影会、クラスの小さな企画。いきなり大きくしなくていい。",
], notes=["※押していたら10秒で流す。"])
story += slide_block(43, "つくる側で、人とつながれた", "38:35 - 39:20", [
    "参加者から運営に回った瞬間、急に人とつながれた。バラバラだった僕の活動が、場を通して人とつながっていった。",
])
story += slide_block(44, "★場をつくると、人との「間」がなくなる", "39:20 - 40:05", [
    "自分の場を持つと、そこに人が集まる。分散していた点が、場を通してつながる。分散 × 場づくり。これが僕の生き方です。",
], notes=["★核②。人生目標へのコールバック。"])
story += slide_block(45, "点が、場を通して「線」になる", "40:05 - 40:35", [
    "図にするとこう。バラバラの点（分散）が、真ん中の『場』を通して、線でつながる。",
], notes=["※押していたら10秒で流す。"])
story += slide_block(46, "高校でできる「場づくり」の一歩", "40:35 - 41:30", [
    "高校でも今からできる。文化祭の実行委員、部活で新企画、小さな集まりを主催、SNSで発信。一回でいい、客からつくる側へ。",
])

# ---- PART 9：締め（3段クロージング） ----
story.append(section_bar("PART 9　締め：分散 → 場づくり → 失敗はない　（41:30 - 44:30）"))
story += slide_block(47, "おさらい：2つの柱", "41:30 - 42:00", [
    "おさらい。柱①分散＝好きを複数持つ。柱②場をつくる＝客をやめてつくる側に回る。この2本で進路の話に戻ります。",
])
story += slide_block(48, "進路に「失敗」はない", "42:00 - 43:00", [
    "たくさん失敗した僕が言います。進路に『失敗』はありません。",
    "大学でも専門でも就職でも、内部進学でも、『なぜその選択をしたか』を言えれば、もう立派な“自分の進路”です。",
], notes=["感情のピーク。ゆっくり、間を取って。"])
story += slide_block(49, "高校生活で今日からできること", "43:00 - 43:30", [
    "今日からできること。好きを3つ書く、未経験を1つ試す（分散）。一度つくる側に立つ、小さく発信する（場づくり）。",
], notes=["※押していたら割愛可。"])
story += slide_block(50, "今日の持ち帰り（3点）", "43:30 - 43:50", [
    "まとめ。①進路も好きも複数あっていい。②客をやめて、つくる側に回る。③進路に失敗はない。",
])
story += slide_block(51, "人生目標で締め（着地）", "43:50 - 44:30", [
    "最後にもう一度。僕の人生目標は『人と人の間に場を作り、間をなくす』。",
    "今日の話はぜんぶここにつながっています。分散して、場をつくる。それが僕の生き方。ありがとうございました。",
], notes=["伏線（S7）を回収して着地。拍手のタイミング。"])

# ---- PART 10：Q&A ----
story.append(section_bar("PART 10　Q&A　（44:30 - 50:00）"))
story += slide_block(52, "Q & A", "44:30 - 49:30", [
    "ここからは何でも。IT業界って実際どう？　数学は仕事で役立つ？　Dellのリアル、大学4年の使い方、場のつくり方、お金、失敗談……何でもOK。",
], notes=[
    "余裕枠として約5分。最初の1問が出るまで7秒待つ（沈黙を恐れない）。",
    "IT志望が多いので、S10-14（Dell/数学×IT）関連の質問が来やすい。1問30〜60秒で返してテンポ維持。",
])
story += slide_block(53, "質問がなければ……（沈黙対策）", "（随時）", [
    "（質問が出ないとき、こちらから振る）",
    "留年したとき親になんて言ったと思う？　インターンのPCどう取り返した？　今の仕事ぶっちゃけ給料いくら？",
    "IT系ねらってる人、どの分野が気になる？　あと——みんな、高校の3年間、何に時間を使うか決めてる？",
], notes=[
    "鉄板の沈黙対策。1問投げて生徒に予想させてから答えると盛り上がる。",
    "最後は『つくる側に回ってみて』で締めると本編に着地する。",
])


# ====================== 出力 ======================
def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("IPAG", 8)
    canvas.setFillColor(GRAY)
    canvas.drawRightString(200 * mm, 10 * mm, f"進路も分散してみませんか（世田谷50分・53枚版）  -  {doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate("build/career_talk_setagaya_script.pdf", pagesize=A4,
                      leftMargin=20 * mm, rightMargin=20 * mm,
                      topMargin=16 * mm, bottomMargin=16 * mm)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
doc.addPageTemplates([PageTemplate(id="t", frames=[frame], onPage=footer)])
doc.build(story)
print("✅ wrote build/career_talk_setagaya_script.pdf")

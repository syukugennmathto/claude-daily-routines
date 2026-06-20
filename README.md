# 進路も分散してみませんか — 明治大学附属世田谷高校 高1 / 50分版

明聖高校・高3・20分版（`career_talk_v6`）をベースに、明治大学附属世田谷高校
（高1・1クラス20〜30名・50分×2回）向けに調整したスライドと台本。

## 成果物（`build/`）
- `career_talk_setagaya.pptx` … スライド本体（全17枚）
- `career_talk_setagaya_script.pdf` … 50分尺のしゃべり台本

## 生成方法
```bash
npm install          # pptxgenjs
node build_slides.js        # -> build/career_talk_setagaya.pptx
python3 generate_script.py  # -> build/career_talk_setagaya_script.pdf（要 reportlab + IPAGothic）
```

## v6からの主な調整
- **時間 20分→50分**：話す尺を圧縮し、ワーク（書く2分＋発表5分）とQ&A（10〜15分）に配分。
- **対象 高3→高1**：受験直前の煽りではなく「これからの3年間・大学4年間の使い方」「好きを複数持つ」へ。
- **内部進学層への配慮**：分散＝進学否定に聞こえないよう、S12に「明治に上がるのも立派。その上でレールの上で何を分散させるか」を追記。
- **新規2枚**：WORK①（書く2分）／WORK②（発表・全体共有）。
- **Q&A／沈黙対策**：トピックを高1×内部進学向けに更新（沈黙ネタの留年/サンリオ/PCは維持）。
- **維持**：タイトル、活動グリッド（6分類）、人生目標3層、岡田斗司夫の分散フレーム、「進路に失敗はない」。

## フォントについて
v6のPDFでテキスト層の一部グリフが化けていた（の→䛾 等）が、これは
**PDF書き出し時のCIDマッピング由来**で、pptx本体のテキストは正しいUnicode。
本リポジトリでは、pptx内テキストが正しく格納されていること（化け文字なし・IPAGothic指定）を
XMLレベルで確認済み。台本PDFはIPAGothicを埋め込んで生成しているため文字化けしない。
PowerPoint/Keynoteで開き、各自の環境でPDF書き出しすればOK。

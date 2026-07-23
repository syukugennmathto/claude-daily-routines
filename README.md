# Honami — Portfolio & Journal

暮らしからうまれる創作を綴る、ライフスタイル雑誌のようなパーソナル・ポートフォリオ。
イラスト、ぬいぐるみ、文房具、写真、ZINE、インテリアを、ひとつの世界として編んでいます。

A premium, lifestyle-editorial personal portfolio built to feel like a beautifully
curated magazine — generous white space, quiet typography, and warm minimalism.

## 技術構成 / Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — カスタムパレット & タイポグラフィ
- **Framer Motion** — fade-in / stagger / parallax などの穏やかな動き
- **next/font** — Noto Sans JP・Zen Maru Gothic・Cormorant Garamond（セルフホスト）
- 画像は **決定論的な SVG プレースホルダー**（`components/EditorialImage.tsx`）。
  実写真に差し替えるときは、この 1 コンポーネントを `next/image` に置き換えるだけで全ページに反映されます。

## 開発 / Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 本番ビルド（フォントをローカルに埋め込み）
npm run start    # 本番サーバー
```

## ディレクトリ / Structure

```
app/                 各ページ（App Router）
  layout.tsx         フォント・メタデータ・構造化データ・ヘッダー/フッター
  page.tsx           Home
  about/ works/ ...   各セクション（[slug] は動的詳細ページ）
  sitemap.ts robots.ts manifest.ts opengraph-image.tsx icon.svg
components/          再利用可能な UI（Hero, WorkCard, Lightbox, ContactForm ...）
  motion/            FadeIn / Stagger
lib/
  site.ts            サイト情報・ナビゲーション
  palette.ts         パレットと SVG 生成ユーティリティ
  content/           コンテンツデータ（ここを編集すれば作品や記事を追加できます）
    works.ts journal.ts zine.ts misc.ts
```

## コンテンツの追加 / Adding content

すべてのコンテンツは `lib/content/` の型付きデータ配列にまとまっています。
新しい作品・日記・ZINE・ぬいぐるみのプロジェクトを追加するには、対応する配列に
オブジェクトを 1 つ足すだけです。ページ・一覧・詳細・サイトマップに自動で反映されます。

- **作品** → `lib/content/works.ts` の `works`
- **日記** → `lib/content/journal.ts` の `journal`
- **ZINE** → `lib/content/zine.ts` の `zines`
- **ぬいぐるみ工程 / アーカイブ** → `lib/content/misc.ts` の `plushStages` / `plushProjects`
- **はむみ・文具の部屋・写真・Lemon8・About** → `lib/content/misc.ts`

## SEO / アクセシビリティ

- ページごとの `metadata`（title / description / canonical / Open Graph）
- 構造化データ（JSON-LD: Person / CreativeWork / Article）
- 動的 `sitemap.xml`・`robots.txt`・`manifest.webmanifest`・favicon・OG 画像
- スキップリンク、`prefers-reduced-motion` 対応、セマンティックな見出し構造、
  画像の代替テキスト、キーボード操作対応の Lightbox。

---

*Made slowly, with care.*

## 単一ファイル版 / Standalone shareable version

`standalone/index.html` は、サイト全体を **1つの自己完結した HTML ファイル**に作り直したものです
（外部依存なし・端末標準フォント使用・スマホ最適化）。ダブルクリックで開くだけで動き、
どんな静的ホスティングにも置けます。スマホで共有したいときに便利です。

A single self-contained HTML file that reproduces the whole site — no build, no
external requests, mobile-first. Open it directly or drop it on any static host.

export type Zine = {
  slug: string;
  title: string;
  titleEn: string;
  issue: string;
  year: string;
  pages: number;
  size: string;
  tone: string;
  cover: string;
  summary: string;
  story: string[];
  preview: { seed: string; caption: string; tone?: string }[];
  info: { label: string; value: string }[];
};

export const zines: Zine[] = [
  {
    slug: "slow-morning",
    title: "おそい朝",
    titleEn: "Slow Morning",
    issue: "No.01",
    year: "2025",
    pages: 32,
    size: "A5",
    tone: "warm",
    cover: "zine-slow-morning-cover",
    summary: "急がない朝の過ごしかたを集めた、はじめての一冊。写真と短い文章と、すこしの余白で。",
    story: [
      "この一冊は、『急がない』ことについての本です。慌ただしい毎日のなかで、朝のほんの30分だけでも、自分のペースを取り戻せたら。そんな願いから生まれました。",
      "コーヒーを淹れること、窓を開けること、何も予定を入れないこと。特別なことは書いていません。でも、そのなんでもなさを、丁寧に綴じたかったのです。",
    ],
    preview: [
      { seed: "zine-slow-1", caption: "表紙", tone: "warm" },
      { seed: "zine-slow-2", caption: "コーヒーのページ", tone: "brown" },
      { seed: "zine-slow-3", caption: "窓辺のページ", tone: "gold" },
      { seed: "zine-slow-4", caption: "余白のページ", tone: "gray" },
    ],
    info: [
      { label: "判型", value: "A5・32ページ" },
      { label: "印刷", value: "オンデマンド・無線綴じ" },
      { label: "発行", value: "2025年 春" },
      { label: "価格", value: "¥1,200(税込)" },
    ],
  },
  {
    slug: "things-i-made",
    title: "つくったもの、つくる理由",
    titleEn: "Things I Made",
    issue: "No.02",
    year: "2025",
    pages: 40,
    size: "B5",
    tone: "sage",
    cover: "zine-things-cover",
    summary: "この一年でつくったものを、制作の裏側とともに振り返る作品集ZINE。",
    story: [
      "つくったものを並べるだけでなく、なぜそれをつくったのか、どんな失敗をしたのかまで書きました。完成品の写真の隣に、ぐしゃぐしゃのラフを載せています。",
      "うまくいかなかった過程こそ、いちばん自分らしい記録だと思うのです。",
    ],
    preview: [
      { seed: "zine-things-1", caption: "表紙", tone: "sage" },
      { seed: "zine-things-2", caption: "ラフと完成品", tone: "gold" },
      { seed: "zine-things-3", caption: "制作メモ", tone: "warm" },
    ],
    info: [
      { label: "判型", value: "B5・40ページ" },
      { label: "印刷", value: "活版+オンデマンド" },
      { label: "発行", value: "2025年 秋" },
      { label: "価格", value: "¥1,600(税込)" },
    ],
  },
  {
    slug: "quiet-places",
    title: "しずかな場所",
    titleEn: "Quiet Places",
    issue: "No.03",
    year: "2026",
    pages: 28,
    size: "A5",
    tone: "gray",
    cover: "zine-quiet-cover",
    summary: "旅先で出会った、しずかな場所の写真とことば。ページをめくるほど、心が静まる一冊。",
    story: [
      "人の少ない朝の公園、古い喫茶店の隅、雪の降る町。心がふっとほどける場所を、写真とわずかな言葉で綴じました。",
      "読むというより、深呼吸するための本です。",
    ],
    preview: [
      { seed: "zine-quiet-1", caption: "表紙", tone: "gray" },
      { seed: "zine-quiet-2", caption: "公園のページ", tone: "sage" },
      { seed: "zine-quiet-3", caption: "喫茶店のページ", tone: "brown" },
    ],
    info: [
      { label: "判型", value: "A5・28ページ" },
      { label: "印刷", value: "オンデマンド・中綴じ" },
      { label: "発行", value: "2026年 冬" },
      { label: "価格", value: "¥1,100(税込)" },
    ],
  },
];

export function getZine(slug: string) {
  return zines.find((z) => z.slug === slug);
}

export type WorkCategory = "illustration" | "design" | "plush" | "goods" | "photography";

export const workCategories: { key: WorkCategory; label: string; labelJa: string }[] = [
  { key: "illustration", label: "Illustration", labelJa: "イラスト" },
  { key: "design", label: "Design", labelJa: "デザイン" },
  { key: "plush", label: "Plush Toys", labelJa: "ぬいぐるみ" },
  { key: "goods", label: "Goods", labelJa: "グッズ" },
  { key: "photography", label: "Photography", labelJa: "写真" },
];

export type Work = {
  slug: string;
  title: string;
  titleEn: string;
  category: WorkCategory;
  year: string;
  tone: string;
  summary: string;
  description: string[];
  process: { step: string; body: string }[];
  gallery: { seed: string; caption: string; tone?: string }[];
  materials?: string[];
  featured?: boolean;
};

export const works: Work[] = [
  {
    slug: "morning-light-series",
    title: "朝のひかり",
    titleEn: "Morning Light Series",
    category: "illustration",
    year: "2025",
    tone: "warm",
    featured: true,
    summary: "窓辺に差しこむ光と、まだ静かな台所。一日のはじまりをすくいとった連作イラスト。",
    materials: ["水彩", "色鉛筆", "岩絵具のような質感"],
    description: [
      "毎朝いちばんに目にする光を、そのまま絵にできないだろうかと思いながら描いた連作です。カーテンのすきま、湯気のたつカップ、床に落ちる影。特別ではない朝を、特別なものとして残したいと思いました。",
      "彩度をおさえた、やわらかな色だけでまとめています。見た人がふっと肩の力を抜けるような、そんな静けさをめざしました。",
    ],
    process: [
      { step: "観察", body: "一週間、毎朝の光をスケッチブックに走り書きしました。時間ごとに色が移っていくのがおもしろくて。" },
      { step: "下描き", body: "構図はできるだけ余白を残すこと。描かない部分にこそ、朝の空気があると思っています。" },
      { step: "彩色", body: "薄い層を何度も重ねて、にじみをコントロールしました。乾くのを待つ時間も好きです。" },
    ],
    gallery: [
      { seed: "morning-light-1", caption: "台所の窓辺", tone: "warm" },
      { seed: "morning-light-2", caption: "湯気とカップ", tone: "gold" },
      { seed: "morning-light-3", caption: "床に落ちる影", tone: "brown" },
      { seed: "morning-light-4", caption: "カーテンのすきま", tone: "warm" },
    ],
  },
  {
    slug: "hamumi-character-design",
    title: "はむみ キャラクターデザイン",
    titleEn: "Hamumi Character Design",
    category: "design",
    year: "2024",
    tone: "sage",
    featured: true,
    summary: "SNSで育てているイラストシリーズ「はむみ」の、キャラクター設計と世界観づくり。",
    description: [
      "まるいフォルムと、ちいさな仕草。はむみは、日々のなかで生まれる感情の代弁者のような存在です。線のやわらかさと、余白のとりかたに、いちばん時間をかけました。",
      "怒っているときも、はむみだと少しだけ愛おしい。そんな塩梅を探しながら、表情のパターンを整理していきました。",
    ],
    process: [
      { step: "ラフ", body: "何十枚もまるを描いて、いちばん安心するプロポーションを探しました。" },
      { step: "表情設計", body: "喜怒哀楽をそれぞれ数パターン。眉と口のわずかな角度で印象が変わります。" },
      { step: "ルール化", body: "線の太さ、色数、余白の量をルールに。誰が見ても『はむみ』とわかるように。" },
    ],
    gallery: [
      { seed: "hamumi-design-1", caption: "基本フォルム", tone: "sage" },
      { seed: "hamumi-design-2", caption: "表情バリエーション", tone: "warm" },
      { seed: "hamumi-design-3", caption: "配色スタディ", tone: "gold" },
    ],
  },
  {
    slug: "little-bear-plush",
    title: "ちいさなくまのぬいぐるみ",
    titleEn: "Little Bear Plush",
    category: "plush",
    year: "2025",
    tone: "brown",
    featured: true,
    summary: "手のひらにおさまる、生成りのくま。型紙から縫製まで、すべて手作業で仕立てました。",
    materials: ["オーガニックコットン", "ウール刺繍糸", "植物染めのリボン"],
    description: [
      "抱いたときの重みまで設計したくて、中綿の量を何度も調整しました。少しだけ重たいほうが、そばにいる感じがするのです。",
      "顔は刺繍で。ミリ単位で表情が変わるので、糸を抜いてはやり直し、いちばん穏やかな顔を探しました。",
    ],
    process: [
      { step: "型紙", body: "紙の上で立体を想像しながら、カーブを何度も引き直しました。" },
      { step: "試作", body: "はじめの一体はいつも歪みます。そこから左右のバランスを整えます。" },
      { step: "仕立て", body: "手縫いで、ゆっくりと。縫い目のリズムが仕上がりの表情になります。" },
    ],
    gallery: [
      { seed: "bear-plush-1", caption: "完成したくま", tone: "brown" },
      { seed: "bear-plush-2", caption: "刺繍の顔", tone: "warm" },
      { seed: "bear-plush-3", caption: "手のひらのサイズ感", tone: "gold" },
      { seed: "bear-plush-4", caption: "植物染めのリボン", tone: "sage" },
    ],
  },
  {
    slug: "everyday-stationery",
    title: "暮らしの文具シリーズ",
    titleEn: "Everyday Stationery",
    category: "goods",
    year: "2024",
    tone: "gold",
    featured: true,
    summary: "書くことが少し楽しくなる、メモパッドとマスキングテープのオリジナルグッズ。",
    materials: ["再生紙", "活版印刷", "水性インク"],
    description: [
      "毎日つかうものだからこそ、主張しすぎないデザインを心がけました。机に置いても風景になじむ、そんな文具です。",
      "活版印刷のわずかな凹みや、紙の耳のざらつき。手仕事の痕跡を、あえて残しています。",
    ],
    process: [
      { step: "図案", body: "余白を主役に。罫線はごく薄く、書く人の邪魔をしないように。" },
      { step: "紙選び", body: "何十種類も試し書きして、インクのにじみ方で決めました。" },
      { step: "印刷", body: "活版の工房へ。圧の強さを立ち会って調整しました。" },
    ],
    gallery: [
      { seed: "stationery-goods-1", caption: "メモパッド", tone: "gold" },
      { seed: "stationery-goods-2", caption: "マスキングテープ", tone: "warm" },
      { seed: "stationery-goods-3", caption: "活版の質感", tone: "brown" },
    ],
  },
  {
    slug: "cafe-afternoon",
    title: "喫茶店の午後",
    titleEn: "Cafe Afternoon",
    category: "photography",
    year: "2025",
    tone: "brown",
    summary: "古い喫茶店の、光と湯気と沈黙。フィルムで撮りためた午後の記録。",
    description: [
      "町の古い喫茶店が好きで、旅先でもかならず一軒はさがします。窓から差す光の角度で、その町の時間が見える気がするのです。",
      "急がずに、一杯を待つ時間。その静けさを写真に残しています。",
    ],
    process: [
      { step: "待つ", body: "いい光になるまで、ただコーヒーを飲みながら待ちます。" },
      { step: "選ぶ", body: "現像から上がってきた中で、いちばん静かな一枚を選びます。" },
    ],
    gallery: [
      { seed: "cafe-afternoon-1", caption: "窓辺の席", tone: "brown" },
      { seed: "cafe-afternoon-2", caption: "湯気", tone: "warm" },
      { seed: "cafe-afternoon-3", caption: "古い床", tone: "gray" },
    ],
  },
  {
    slug: "botanical-postcards",
    title: "植物のポストカード",
    titleEn: "Botanical Postcards",
    category: "illustration",
    year: "2023",
    tone: "sage",
    summary: "散歩の途中で出会った草花を描いた、季節のポストカード集。",
    description: [
      "名前も知らない道端の草に、心を惹かれることがあります。図鑑で調べて、名前を知って、また少し世界が広がる。その小さな喜びをカードにしました。",
    ],
    process: [
      { step: "採集", body: "散歩のたびに、気になった草花を一輪だけ持ち帰ります。" },
      { step: "写生", body: "枯れてしまう前に、その日のうちに描き上げます。" },
    ],
    gallery: [
      { seed: "botanical-1", caption: "野の花", tone: "sage" },
      { seed: "botanical-2", caption: "葉のかたち", tone: "gold" },
      { seed: "botanical-3", caption: "季節のカード", tone: "warm" },
    ],
  },
];

export function getWork(slug: string) {
  return works.find((w) => w.slug === slug);
}

export function relatedWorks(slug: string, category: WorkCategory, limit = 3) {
  const same = works.filter((w) => w.slug !== slug && w.category === category);
  const others = works.filter((w) => w.slug !== slug && w.category !== category);
  return [...same, ...others].slice(0, limit);
}

export const featuredWorks = works.filter((w) => w.featured);

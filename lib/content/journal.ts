export type JournalCategory =
  | "plush"
  | "zine"
  | "stationery"
  | "workspace"
  | "process"
  | "photography"
  | "travel"
  | "exhibition";

export const journalCategories: { key: JournalCategory; label: string }[] = [
  { key: "plush", label: "ぬいぐるみ" },
  { key: "zine", label: "ZINE" },
  { key: "stationery", label: "文具" },
  { key: "workspace", label: "アトリエ" },
  { key: "process", label: "制作の記録" },
  { key: "photography", label: "写真" },
  { key: "travel", label: "旅" },
  { key: "exhibition", label: "展示" },
];

export type JournalPost = {
  slug: string;
  title: string;
  category: JournalCategory;
  date: string;
  readMinutes: number;
  tone: string;
  excerpt: string;
  body: string[];
  gallery?: { seed: string; caption: string; tone?: string }[];
  featured?: boolean;
};

export const journal: JournalPost[] = [
  {
    slug: "making-a-plush-from-scratch",
    title: "ぬいぐるみができるまで、ひと針ずつ",
    category: "plush",
    date: "2026-06-18",
    readMinutes: 7,
    tone: "brown",
    featured: true,
    excerpt: "一枚の布が、そばにいてくれる存在になるまで。型紙づくりから仕上げまでの、ゆっくりとした時間の記録です。",
    body: [
      "ぬいぐるみをつくるとき、いちばん長く向き合うのは、じつは布ではなく紙です。型紙。この曲線ひとつで、できあがる子の性格まで変わってしまう。だから、鉛筆で引いては消し、また引いて、を何度もくり返します。",
      "布を裁つ瞬間は、いつも少しだけ緊張します。もう後戻りできない、という感覚。でもその緊張が、手を丁寧にしてくれるのだと思います。",
      "縫っている時間は、無心です。針を刺して、糸を引いて、また刺す。そのリズムだけがある。気づくと外は暗くなっていて、手のなかにはさっきまでなかった重みがあります。",
      "最後に綿を入れて、顔をつけると、ふいに『その子』になる瞬間が訪れます。うまく言えないのだけれど、目が合った気がする。そのときはじめて、完成したと感じます。",
    ],
    gallery: [
      { seed: "journal-plush-a", caption: "型紙のスケッチ", tone: "brown" },
      { seed: "journal-plush-b", caption: "裁断した布", tone: "warm" },
      { seed: "journal-plush-c", caption: "綿を入れる", tone: "gold" },
    ],
  },
  {
    slug: "how-i-make-a-zine",
    title: "ZINEをつくるという小さな祭り",
    category: "zine",
    date: "2026-05-30",
    readMinutes: 6,
    tone: "gold",
    featured: true,
    excerpt: "だれに頼まれたわけでもない一冊を、なぜつくるのか。台割から製本までの、手づくりの記録。",
    body: [
      "ZINEをつくるのは、私にとって小さなお祭りのようなものです。締め切りも、頼んでくる人もいない。ただ『これを残しておきたい』という気持ちだけが原動力になります。",
      "まずは台割から。付箋に見出しを書いて、机の上で何度も並べ替えます。ページの順番は、読む人の呼吸のリズム。急がせたくない場所には、あえて余白のページを差しこみます。",
      "印刷して、折って、綴じる。単純作業のようでいて、一冊ずつわずかに表情がちがう。その不揃いさが、手づくりの証だと思っています。",
    ],
    gallery: [
      { seed: "journal-zine-a", caption: "台割の付箋", tone: "gold" },
      { seed: "journal-zine-b", caption: "刷り上がり", tone: "warm" },
    ],
  },
  {
    slug: "fountain-pen-and-ink-notes",
    title: "この一年で出会った、文具のこと",
    category: "stationery",
    date: "2026-05-12",
    readMinutes: 5,
    tone: "sage",
    excerpt: "書き味、紙とのあいさつ、インクの香り。日々の相棒になった文房具を、正直に綴ります。",
    body: [
      "文具のレビューというと、スペックの話になりがちですが、私が気にするのはもっと感覚的なことです。キャップを外すときの音。ペン先が紙に触れる瞬間の、あの一瞬のためらい。",
      "この一年でいちばん手が伸びたのは、細字の万年筆でした。手帳の小さな余白にも書きこめて、線に表情がある。書くことが、少しだけ楽しみになりました。",
      "道具が変わると、書く内容まで変わる気がします。丁寧な道具は、丁寧な言葉を引き出してくれる。そんな気がしています。",
    ],
  },
  {
    slug: "rearranging-my-desk",
    title: "机をひとつ、動かしただけで",
    category: "workspace",
    date: "2026-04-24",
    readMinutes: 4,
    tone: "warm",
    excerpt: "窓に向けて机を動かした。それだけのことで、制作の時間がまるごと変わった話。",
    body: [
      "模様替えというほどのことではなくて、ただ机を窓のほうへ90度回しただけです。でも、これがよかった。顔を上げると空が見える。それだけで、制作の合間の呼吸が深くなりました。",
      "道具の定位置も見直しました。よく使うものは手の届く高さに、たまに使うものは少し遠くに。動線が整うと、頭のなかも整う気がします。",
    ],
    gallery: [
      { seed: "journal-desk-a", caption: "窓辺の机", tone: "warm" },
      { seed: "journal-desk-b", caption: "道具の定位置", tone: "sage" },
    ],
  },
  {
    slug: "on-creative-process",
    title: "うまくいかない日の、過ごしかた",
    category: "process",
    date: "2026-03-28",
    readMinutes: 6,
    tone: "gray",
    excerpt: "手が止まる日は必ずある。そんな日をどう受けとめ、どうやり過ごすか、についての覚え書き。",
    body: [
      "つくる仕事をしていると、どうしても手が動かない日があります。以前はそれが怖かったのですが、最近は『そういう日もある』と受けとれるようになりました。",
      "そんな日は、無理に描かず、散歩に出ます。あるいは、誰かの作品を見にいく。入れることをやめると、出すことができなくなる。だから、うまくいかない日は『入れる日』にしています。",
      "不思議なもので、いちばんいいアイデアは、机の前ではなく、道の途中でやってきます。",
    ],
  },
  {
    slug: "photographing-light",
    title: "光を待つ、という撮りかた",
    category: "photography",
    date: "2026-03-06",
    readMinutes: 5,
    tone: "brown",
    excerpt: "いい写真は、いい光からしか生まれない。だから私は、ただ待つ。フィルムで撮る理由のこと。",
    body: [
      "写真を撮るとき、私はほとんど『待つ』ことに時間を使っています。被写体を探すより、光がよくなるのを待つ。雲が流れて、窓辺にやわらかい光が落ちる、その一瞬を。",
      "フィルムで撮るのは、待つ姿勢が身につくからかもしれません。枚数が限られているぶん、一枚に込める気持ちが変わります。",
    ],
    gallery: [
      { seed: "journal-photo-a", caption: "午後の斜光", tone: "brown" },
      { seed: "journal-photo-b", caption: "窓辺のひかり", tone: "gold" },
    ],
  },
  {
    slug: "a-trip-to-the-north",
    title: "北へ、色をさがす旅",
    category: "travel",
    date: "2026-02-14",
    readMinutes: 7,
    tone: "sage",
    excerpt: "雪の白、木の茶、空の灰色。北の町で出会った色を、スケッチブックに連れて帰りました。",
    body: [
      "冬のあいだ、北の小さな町を訪ねました。目的は、色をさがすこと。雪におおわれた町の色数はとても少なくて、でもその少なさが、かえって豊かに感じられました。",
      "白といっても、朝の白、昼の白、夕暮れの白がある。木の茶色にも、無数の階調がある。旅から帰ると、私のパレットは少しだけ深くなっていました。",
    ],
    gallery: [
      { seed: "journal-travel-a", caption: "雪の町並み", tone: "gray" },
      { seed: "journal-travel-b", caption: "木の質感", tone: "brown" },
      { seed: "journal-travel-c", caption: "冬の空", tone: "sage" },
    ],
  },
  {
    slug: "my-first-exhibition",
    title: "はじめての展示を終えて",
    category: "exhibition",
    date: "2026-01-20",
    readMinutes: 6,
    tone: "gold",
    excerpt: "小さなギャラリーでの、はじめての個展。作品が誰かの暮らしに旅立っていく、その日の記録。",
    body: [
      "はじめての個展を開きました。小さなギャラリーの白い壁に、これまで描きためた絵と、つくったぬいぐるみを並べて。準備の日々は緊張の連続でしたが、幸せな時間でもありました。",
      "いちばん嬉しかったのは、作品の前で立ち止まって、静かに見てくださる方の姿でした。言葉はなくても、伝わっているのがわかる。つくってよかった、と心から思えました。",
      "会期の最後、作品がひとつずつ誰かの家へ旅立っていくのを見送りながら、また次のものをつくろう、と思いました。",
    ],
    gallery: [
      { seed: "journal-exhibition-a", caption: "白い壁の展示", tone: "warm" },
      { seed: "journal-exhibition-b", caption: "在廊の午後", tone: "gold" },
    ],
  },
];

export function getPost(slug: string) {
  return journal.find((p) => p.slug === slug);
}

export function relatedPosts(slug: string, limit = 3) {
  return journal.filter((p) => p.slug !== slug).slice(0, limit);
}

export const sortedJournal = [...journal].sort((a, b) => (a.date < b.date ? 1 : -1));
export const featuredJournal = sortedJournal.filter((p) => p.featured);

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
}

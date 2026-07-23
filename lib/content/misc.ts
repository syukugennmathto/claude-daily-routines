// Plush process, Hamumi, stationery_room, photography, Lemon8, About, Instagram.

/* ---------- Plush Making ---------- */
export type PlushStage = {
  key: string;
  step: string;
  title: string;
  body: string;
  seed: string;
  tone: string;
};

export const plushStages: PlushStage[] = [
  {
    key: "idea",
    step: "01",
    title: "アイデア",
    body: "どんな子に、そばにいてほしいか。手触りや重さ、抱いたときの気持ちから想像をはじめます。まずは言葉とちいさな落書きで。",
    seed: "plush-idea",
    tone: "warm",
  },
  {
    key: "sketch",
    step: "02",
    title: "スケッチ",
    body: "正面・横・後ろから、立体を思い描いて描きます。まるみのバランスが、その子の性格になります。",
    seed: "plush-sketch",
    tone: "sage",
  },
  {
    key: "pattern",
    step: "03",
    title: "型紙",
    body: "平面の紙が立体になる不思議。カーブを引いては試作し、また引き直す。いちばん根気のいる工程です。",
    seed: "plush-pattern",
    tone: "gray",
  },
  {
    key: "prototype",
    step: "04",
    title: "試作",
    body: "はじめの一体は歪むもの。左右差を確かめ、綿の量を調整し、理想のフォルムに近づけていきます。",
    seed: "plush-prototype",
    tone: "gold",
  },
  {
    key: "manufacturing",
    step: "05",
    title: "仕立て",
    body: "生地を裁ち、手縫いでゆっくりと。縫い目のリズムが、そのまま表情になります。顔は刺繍で、ミリ単位で。",
    seed: "plush-manufacturing",
    tone: "brown",
  },
  {
    key: "finished",
    step: "06",
    title: "完成",
    body: "綿を入れ、顔をつけると、ふいに『その子』になる瞬間が訪れます。名前をつけて、送り出します。",
    seed: "plush-finished",
    tone: "warm",
  },
];

export type PlushProject = {
  name: string;
  year: string;
  seed: string;
  tone: string;
  note: string;
};

export const plushProjects: PlushProject[] = [
  { name: "ちいさなくま", year: "2025", seed: "plush-proj-bear", tone: "brown", note: "手のひらサイズ・生成り" },
  { name: "ねむりうさぎ", year: "2025", seed: "plush-proj-rabbit", tone: "warm", note: "抱き枕サイズ・ウール混" },
  { name: "まめしば", year: "2024", seed: "plush-proj-shiba", tone: "gold", note: "受注制作・植物染め" },
];

/* ---------- Hamumi Diary ---------- */
export const hamumi = {
  handle: "@hamumi_no_",
  url: "https://instagram.com/hamumi_no_",
  intro: [
    "「はむみ」は、日々のなかで生まれるちいさな感情を代弁してくれる、まるいキャラクターです。うれしい日も、ちょっと落ちこんだ日も、はむみがとなりにいると、少しだけ肩の力が抜ける。そんな存在をめざして描いています。",
    "Instagram（@hamumi_no_）で、ほぼ毎日、はむみのイラストや4コマを更新しています。",
  ],
  characters: [
    { name: "はむみ", seed: "hamumi-char-1", tone: "warm", note: "主人公。のんびり屋で、食いしんぼう。" },
    { name: "こはむ", seed: "hamumi-char-2", tone: "gold", note: "はむみの弟分。すぐ泣くけど、すぐ笑う。" },
    { name: "くろまめ", seed: "hamumi-char-3", tone: "gray", note: "無口な相棒。じつは一番の甘えん坊。" },
  ],
  comics: [
    { seed: "hamumi-comic-1", caption: "朝が起きられない話", tone: "warm" },
    { seed: "hamumi-comic-2", caption: "おやつの誘惑", tone: "gold" },
    { seed: "hamumi-comic-3", caption: "雨の日の過ごしかた", tone: "sage" },
    { seed: "hamumi-comic-4", caption: "がんばれない日", tone: "gray" },
  ],
  latest: Array.from({ length: 6 }).map((_, i) => ({
    seed: `hamumi-latest-${i}`,
    tone: ["warm", "gold", "sage", "brown", "gray", "warm"][i],
  })),
};

/* ---------- stationery_room ---------- */
export const stationery = {
  handle: "@stationery_room_",
  url: "https://instagram.com/stationery_room_",
  lead: "文具と、机まわりと、暮らしの道具。使うたびに心が整う、お気に入りだけを置いた部屋のこと。",
  intro: [
    "stationery_room は、私の創作の土台になっている場所と道具の記録です。新しいものをどんどん増やすのではなく、ほんとうに手になじむものだけを、長く。そんな付き合いかたを大切にしています。",
    "整った机は、整った心。道具のひとつひとつに定位置があって、朝いちばんにそこへ座ると、自然と背筋がのびるのです。",
  ],
  features: [
    { title: "文具", body: "細字の万年筆、色を選びぬいたインク、書き味で選んだノート。", seed: "stationery-pens", tone: "gold" },
    { title: "机まわり", body: "窓に向けた木の机。よく使うものだけを手の届く高さに。", seed: "stationery-desk", tone: "warm" },
    { title: "収納", body: "見せる収納と、隠す収納。ガラス瓶と、木箱と、余白。", seed: "stationery-storage", tone: "sage" },
    { title: "インテリア", body: "ドライフラワー、古い本、やわらかな間接照明。", seed: "stationery-interior", tone: "brown" },
    { title: "創作の道具", body: "絵の具、裁縫箱、カメラ。使い込まれた道具ほど愛おしい。", seed: "stationery-tools", tone: "gray" },
    { title: "日々のひらめき", body: "手帳に貼った切り抜き、集めた紙もの、心が動いた断片。", seed: "stationery-inspo", tone: "gold" },
  ],
  gallery: Array.from({ length: 8 }).map((_, i) => ({
    seed: `stationery-grid-${i}`,
    tone: ["gold", "warm", "sage", "brown", "gray", "gold", "warm", "sage"][i],
  })),
};

/* ---------- Photography ---------- */
export type PhotoCategory = "portrait" | "nature" | "cafe" | "flowers" | "travel" | "daily";

export const photoCategories: { key: PhotoCategory; label: string; labelJa: string }[] = [
  { key: "portrait", label: "Portrait", labelJa: "人物" },
  { key: "nature", label: "Nature", labelJa: "自然" },
  { key: "cafe", label: "Cafe", labelJa: "喫茶" },
  { key: "flowers", label: "Flowers", labelJa: "花" },
  { key: "travel", label: "Travel", labelJa: "旅" },
  { key: "daily", label: "Daily Life", labelJa: "日々" },
];

export const photography = {
  handle: "@honami.photo",
  url: "https://instagram.com/honami.photo",
  lead: "光を待って、そっとシャッターを切る。フィルムで撮りためた、静かな一瞬たち。",
  photos: [
    { seed: "photo-portrait-1", category: "portrait", caption: "窓辺の横顔", tone: "warm", ratio: "4 / 5" },
    { seed: "photo-nature-1", category: "nature", caption: "朝もやの森", tone: "sage", ratio: "3 / 2" },
    { seed: "photo-cafe-1", category: "cafe", caption: "喫茶店の光", tone: "brown", ratio: "4 / 5" },
    { seed: "photo-flowers-1", category: "flowers", caption: "一輪の花", tone: "gold", ratio: "1 / 1" },
    { seed: "photo-travel-1", category: "travel", caption: "北の町並み", tone: "gray", ratio: "3 / 2" },
    { seed: "photo-daily-1", category: "daily", caption: "洗いものの手", tone: "warm", ratio: "4 / 5" },
    { seed: "photo-nature-2", category: "nature", caption: "雨あがりの葉", tone: "sage", ratio: "1 / 1" },
    { seed: "photo-cafe-2", category: "cafe", caption: "コーヒーと湯気", tone: "brown", ratio: "4 / 5" },
    { seed: "photo-flowers-2", category: "flowers", caption: "花瓶の影", tone: "gold", ratio: "3 / 2" },
    { seed: "photo-portrait-2", category: "portrait", caption: "手のしぐさ", tone: "warm", ratio: "1 / 1" },
    { seed: "photo-travel-2", category: "travel", caption: "旅の途中", tone: "gray", ratio: "4 / 5" },
    { seed: "photo-daily-2", category: "daily", caption: "夕暮れの台所", tone: "brown", ratio: "3 / 2" },
  ] as { seed: string; category: PhotoCategory; caption: string; tone: string; ratio: string }[],
};

/* ---------- Lemon8 ---------- */
export const lemon8 = {
  url: "https://www.lemon8-app.com/",
  lead: "暮らしと創作のヒントを、雑誌の記事のように。Lemon8で発信している特集たち。",
  articles: [
    { title: "小さな部屋を、好きなものだけで満たす", topic: "Room", seed: "lemon8-room", tone: "warm", summary: "限られた広さでも心地よく。余白を活かした部屋づくりのコツを7つ。" },
    { title: "書くのが楽しくなる、文具の選びかた", topic: "Stationery", seed: "lemon8-stationery", tone: "gold", summary: "スペックより感覚。手になじむ一本の見つけかた。" },
    { title: "つくる暮らしのはじめかた", topic: "Creative Life", seed: "lemon8-creative", tone: "sage", summary: "特別な才能はいらない。日々を素材にする視点のこと。" },
    { title: "端切れでつくる、小さなDIY", topic: "DIY", seed: "lemon8-diy", tone: "brown", summary: "余った布と15分で。暮らしにひとつ、手づくりを。" },
    { title: "はかどる机まわりの整えかた", topic: "Workspace", seed: "lemon8-workspace", tone: "gray", summary: "動線を整えると、集中が続く。机の見直しガイド。" },
    { title: "ぬいぐるみができるまで密着", topic: "Making", seed: "lemon8-making", tone: "warm", summary: "型紙から仕上げまで、制作の裏側をぜんぶ見せます。" },
    { title: "ていねいすぎない、ていねいな暮らし", topic: "Lifestyle", seed: "lemon8-lifestyle", tone: "gold", summary: "がんばりすぎない。心地よさを優先する日々の工夫。" },
  ],
};

/* ---------- About ---------- */
export const about = {
  lead: "はじめまして、Honami です。暮らしのなかの小さな発見を、絵やぬいぐるみや写真にしています。",
  intro: [
    "特別な出来事より、なんでもない日々のほうが好きです。朝のひかり、道端の草、古い喫茶店の静けさ。そういう小さなものに心が動くたび、手を動かしたくなります。",
    "イラスト、ぬいぐるみ、文具、写真。ジャンルはばらばらに見えるかもしれませんが、私のなかではぜんぶ地続きです。『暮らしをすくいとって、かたちにする』という一本の線で、つながっています。",
  ],
  philosophy: [
    "急がないこと。手を抜かないこと。うまくやろうとしすぎないこと。この三つを、いつも心に置いています。",
    "つくったものが、誰かの日常にそっと寄り添えたら。それ以上に嬉しいことはありません。",
  ],
  tools: [
    { name: "水彩・色鉛筆", note: "やわらかな階調のために" },
    { name: "細字の万年筆", note: "手帳と下描きの相棒" },
    { name: "裁縫箱", note: "祖母から受け継いだもの" },
    { name: "フィルムカメラ", note: "光を待つための道具" },
    { name: "木の机", note: "窓に向けた、創作の場所" },
    { name: "古い本", note: "配色と余白の先生" },
  ],
  inspirations: [
    "北欧の暮らしと、自然の素材",
    "日本の手仕事と、余白の美しさ",
    "古い雑誌の、静かな誌面",
    "ヨーロッパのヴィンテージの色",
    "季節のうつろいと、朝のひかり",
  ],
  timeline: [
    { year: "2019", body: "暮らしの記録として、イラストを描きはじめる。" },
    { year: "2021", body: "Instagramで「はむみ」の連載をスタート。" },
    { year: "2023", body: "ぬいぐるみと文具の制作をはじめる。" },
    { year: "2025", body: "はじめてのZINEを刊行。個展を開催。" },
  ],
};

/* ---------- Instagram (mock feed shared across pages) ---------- */
export const instagramFeed = [
  { seed: "ig-1", tone: "warm", account: "@honami.photo" },
  { seed: "ig-2", tone: "gold", account: "@hamumi_no_" },
  { seed: "ig-3", tone: "sage", account: "@stationery_room_" },
  { seed: "ig-4", tone: "brown", account: "@honami.photo" },
  { seed: "ig-5", tone: "gray", account: "@hamumi_no_" },
  { seed: "ig-6", tone: "warm", account: "@stationery_room_" },
];

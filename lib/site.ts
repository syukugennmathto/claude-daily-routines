export const site = {
  name: "Honami",
  title: "Honami — 暮らしからうまれる、つくるしごと",
  tagline: "暮らしのなかの小さな発見から、絵や、ぬいぐるみや、文房具や、写真がうまれます。",
  description:
    "イラスト、ぬいぐるみ、ハンドメイド、文房具、写真、インテリア。日々の暮らしをすくいとって、ひとつの世界にする。雑誌をめくるように楽しめる、Honami のポートフォリオ。",
  url: "https://honami-portfolio.example.com",
  locale: "ja_JP",
  author: "Honami",
  email: "hello@honami-studio.jp",
  ogImageAlt: "Honami のポートフォリオ",
  socials: [
    { label: "Hamumi Diary", handle: "@hamumi_no_", url: "https://instagram.com/hamumi_no_" },
    { label: "stationery_room", handle: "@stationery_room_", url: "https://instagram.com/stationery_room_" },
    { label: "Photography", handle: "@honami.photo", url: "https://instagram.com/honami.photo" },
    { label: "Lemon8", handle: "@honami", url: "https://www.lemon8-app.com/" },
  ],
};

export type NavItem = {
  label: string;
  labelJa: string;
  href: string;
};

export const nav: NavItem[] = [
  { label: "Home", labelJa: "ホーム", href: "/" },
  { label: "About", labelJa: "わたしについて", href: "/about" },
  { label: "Works", labelJa: "つくったもの", href: "/works" },
  { label: "Plush Making", labelJa: "ぬいぐるみ", href: "/plush-making" },
  { label: "ZINE", labelJa: "ジン", href: "/zine" },
  { label: "Hamumi Diary", labelJa: "はむみ日記", href: "/hamumi-diary" },
  { label: "stationery_room", labelJa: "文具の部屋", href: "/stationery-room" },
  { label: "Photography", labelJa: "写真", href: "/photography" },
  { label: "Lemon8", labelJa: "レモンエイト", href: "/lemon8" },
  { label: "Journal", labelJa: "日記", href: "/journal" },
  { label: "Contact", labelJa: "おたより", href: "/contact" },
];

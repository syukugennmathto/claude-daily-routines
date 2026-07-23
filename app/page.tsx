import Link from "next/link";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import WorkCard from "@/components/WorkCard";
import JournalCard from "@/components/JournalCard";
import InstagramGrid from "@/components/InstagramGrid";
import EditorialImage from "@/components/EditorialImage";
import FadeIn from "@/components/motion/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { featuredWorks } from "@/lib/content/works";
import { featuredJournal, sortedJournal } from "@/lib/content/journal";
import { nav, site } from "@/lib/site";

export default function HomePage() {
  const journalPicks = (featuredJournal.length ? featuredJournal : sortedJournal).slice(0, 3);

  return (
    <>
      <Hero />

      {/* Introduction — the quiet opening spread */}
      <section className="container-editorial py-24 md:py-32">
        <div className="grid gap-14 md:grid-cols-12 md:items-center">
          <FadeIn className="md:col-span-5">
            <div className="overflow-hidden rounded-2xl">
              <EditorialImage seed="intro-portrait" tone="sage" ratio="4 / 5" label="Honami のポートレート" />
            </div>
          </FadeIn>
          <div className="md:col-span-7 md:pl-6">
            <FadeIn>
              <p className="eyebrow">A Quiet Introduction</p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <p className="mt-6 font-display text-2xl leading-relaxed text-ink md:text-3xl">
                なんでもない一日のなかに、<br className="hidden md:block" />
                つくりたいものは、いつもある。
              </p>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="mt-8 max-w-xl text-base leading-loose text-ink-soft">
                イラスト、ぬいぐるみ、文具、写真。かたちはさまざまでも、そのもとにあるのは、いつも暮らしのなかの小さな発見です。朝のひかり、道端の草、古い喫茶店の静けさ。心が動いた瞬間を、ていねいにかたちにしています。
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <Link href="/about" className="link-underline mt-8 inline-block text-sm tracking-widest text-dusty-brown">
                もっと知る →
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Featured works */}
      <section className="container-editorial py-16 md:py-20">
        <SectionHeading eyebrow="Selected Works" title="えらんだ、しごと" href="/works" />
        <StaggerGroup className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {featuredWorks.slice(0, 4).map((work) => (
            <StaggerItem key={work.slug}>
              <WorkCard work={work} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Worlds — a directory of the site's rooms */}
      <section className="container-editorial py-24 md:py-32">
        <FadeIn>
          <p className="eyebrow text-center">Explore the World</p>
          <h2 className="mx-auto mt-4 max-w-xl text-center font-display text-3xl text-ink md:text-4xl">
            この場所を、めぐる
          </h2>
        </FadeIn>
        <StaggerGroup className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-3">
          {worlds.map((w) => (
            <StaggerItem key={w.href}>
              <Link href={w.href} className="group relative block overflow-hidden rounded-2xl">
                <div className="transition-transform duration-700 ease-editorial group-hover:scale-105">
                  <EditorialImage seed={`world-${w.href}`} tone={w.tone} ratio="4 / 3" label={w.title} />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/55 via-ink/5 to-transparent p-5">
                  <p className="font-display text-lg text-ivory md:text-xl">{w.title}</p>
                  <p className="text-[11px] tracking-widest text-ivory/75">{w.en}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Latest journal */}
      <section className="bg-warm-white py-24 md:py-32">
        <div className="container-editorial">
          <SectionHeading eyebrow="From the Journal" title="さいきんの日記" href="/journal" />
          <StaggerGroup className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-3">
            {journalPicks.map((post) => (
              <StaggerItem key={post.slug}>
                <JournalCard post={post} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Instagram */}
      <section className="container-editorial py-24 md:py-32">
        <div className="flex flex-col items-center text-center">
          <FadeIn>
            <p className="eyebrow">Latest on Instagram</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">日々のかけら</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-loose text-ink-soft">
              作品のとちゅうや、机まわりの風景を、Instagramで綴っています。
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.1}>
          <div className="mt-12">
            <InstagramGrid />
          </div>
        </FadeIn>
        <FadeIn delay={0.16}>
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {site.socials.slice(0, 3).map((s) => (
              <a key={s.handle} href={s.url} target="_blank" rel="noreferrer" className="link-underline text-sm tracking-widest text-dusty-brown">
                {s.handle}
              </a>
            ))}
          </div>
        </FadeIn>
      </section>
    </>
  );
}

const worlds = [
  { href: "/plush-making", title: "ぬいぐるみ", en: "Plush Making", tone: "brown" },
  { href: "/zine", title: "ジン", en: "ZINE", tone: "gold" },
  { href: "/hamumi-diary", title: "はむみ日記", en: "Hamumi Diary", tone: "warm" },
  { href: "/stationery-room", title: "文具の部屋", en: "stationery_room", tone: "sage" },
  { href: "/photography", title: "写真", en: "Photography", tone: "gray" },
  { href: "/lemon8", title: "レモンエイト", en: "Lemon8", tone: "gold" },
];

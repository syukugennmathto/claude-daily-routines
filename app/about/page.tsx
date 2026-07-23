import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Prose from "@/components/Prose";
import EditorialImage from "@/components/EditorialImage";
import FadeIn from "@/components/motion/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { about } from "@/lib/content/misc";

export const metadata: Metadata = {
  title: "About",
  description: "つくり手 Honami の、プロフィールと創作の哲学、仕事場、そして心を動かすもの。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="わたしについて" titleEn="A Maker of Everyday Things" lead={about.lead} />

      {/* Portrait + intro */}
      <section className="container-editorial py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-12 md:items-start">
          <FadeIn className="md:col-span-5 md:sticky md:top-28">
            <div className="overflow-hidden rounded-2xl">
              <EditorialImage seed="about-portrait" tone="warm" ratio="4 / 5" label="Honami のポートレート" />
            </div>
            <p className="mt-4 text-center font-serif text-sm italic text-dusty-brown">Honami — illustrator & maker</p>
          </FadeIn>
          <div className="md:col-span-7">
            <p className="eyebrow">Story</p>
            <h2 className="mt-4 font-display text-2xl leading-relaxed text-ink md:text-3xl">
              暮らしを、すくいとる。
            </h2>
            <Prose className="mt-8" paragraphs={about.intro} />

            <div className="rule my-14" />

            <p className="eyebrow">Creative Philosophy</p>
            <h3 className="mt-4 font-display text-2xl text-ink">つくることの、三つの約束</h3>
            <Prose className="mt-8" paragraphs={about.philosophy} />
          </div>
        </div>
      </section>

      {/* Favorite tools */}
      <section className="bg-warm-white py-20 md:py-28">
        <div className="container-editorial">
          <FadeIn>
            <p className="eyebrow">Favorite Tools</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">お気に入りの道具</h2>
          </FadeIn>
          <StaggerGroup className="mt-12 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {about.tools.map((t) => (
              <StaggerItem key={t.name}>
                <div className="flex items-baseline justify-between border-b border-light-gray pb-4">
                  <span className="font-display text-lg text-ink">{t.name}</span>
                  <span className="ml-4 text-right font-serif text-sm italic text-dusty-brown">{t.note}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Workspace */}
      <section className="container-editorial py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <FadeIn>
            <div className="overflow-hidden rounded-2xl">
              <EditorialImage seed="about-workspace" tone="sage" ratio="4 / 3" label="仕事場" />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="eyebrow">Workspace</p>
            <h2 className="mt-4 font-display text-3xl text-ink">窓辺の、小さなアトリエ</h2>
            <p className="mt-6 max-w-md leading-loose text-ink-soft">
              窓に向けた木の机が、私の仕事場です。よく使う道具は手の届く高さに、絵の具や布は木箱のなかに。整った机に座ると、自然と背筋がのびて、心も静かになります。詳しくは
              <span className="font-serif italic"> stationery_room </span>
              で綴っています。
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Inspiration + timeline */}
      <section className="bg-warm-white py-20 md:py-28">
        <div className="container-editorial grid gap-16 md:grid-cols-2">
          <div>
            <FadeIn>
              <p className="eyebrow">What Inspires Me</p>
              <h2 className="mt-4 font-display text-3xl text-ink">心を動かすもの</h2>
            </FadeIn>
            <StaggerGroup className="mt-8 space-y-4">
              {about.inspirations.map((line, i) => (
                <StaggerItem key={i}>
                  <p className="flex items-baseline gap-4 text-ink-soft">
                    <span className="font-serif text-sm italic text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <span className="leading-relaxed">{line}</span>
                  </p>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
          <div>
            <FadeIn>
              <p className="eyebrow">Timeline</p>
              <h2 className="mt-4 font-display text-3xl text-ink">これまでのこと</h2>
            </FadeIn>
            <StaggerGroup className="mt-8 space-y-6">
              {about.timeline.map((t) => (
                <StaggerItem key={t.year}>
                  <div className="flex gap-6 border-b border-light-gray pb-6">
                    <span className="font-serif text-xl italic text-dusty-brown">{t.year}</span>
                    <p className="leading-relaxed text-ink-soft">{t.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>
    </>
  );
}

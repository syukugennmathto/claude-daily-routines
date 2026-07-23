import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import EditorialImage from "@/components/EditorialImage";
import Lightbox from "@/components/Lightbox";
import FadeIn from "@/components/motion/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { hamumi } from "@/lib/content/misc";

export const metadata: Metadata = {
  title: "Hamumi Diary",
  description: "日々の感情を代弁するイラストシリーズ「はむみ」。キャラクター紹介、4コマ、最新の投稿。@hamumi_no_",
  alternates: { canonical: "/hamumi-diary" },
};

export default function HamumiPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hamumi Diary"
        title="はむみ日記"
        titleEn="A Little Round Friend"
        lead={hamumi.intro[0]}
      />

      <div className="container-editorial pt-8">
        <FadeIn>
          <a href={hamumi.url} target="_blank" rel="noreferrer" className="link-underline text-sm tracking-widest text-dusty-brown">
            Instagram {hamumi.handle} →
          </a>
        </FadeIn>
      </div>

      {/* Characters */}
      <section className="container-editorial py-20 md:py-28">
        <FadeIn>
          <p className="eyebrow">Characters</p>
          <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">登場人物</h2>
        </FadeIn>
        <StaggerGroup className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3">
          {hamumi.characters.map((c) => (
            <StaggerItem key={c.name}>
              <div className="text-center">
                <div className="overflow-hidden rounded-full">
                  <EditorialImage seed={c.seed} tone={c.tone} ratio="1 / 1" label={c.name} />
                </div>
                <h3 className="mt-6 font-display text-2xl text-ink">{c.name}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">{c.note}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* Comics */}
      <section className="bg-warm-white py-20 md:py-28">
        <div className="container-editorial">
          <FadeIn>
            <p className="eyebrow">Comics</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">4コマと、まんが</h2>
            <p className="mt-4 max-w-lg leading-loose text-ink-soft">
              うまくいかない日も、はむみと一緒なら少し笑える。日々の断片を、短いまんがにしています。
            </p>
          </FadeIn>
          <div className="mt-12">
            <Lightbox items={hamumi.comics} columns="grid-cols-2 md:grid-cols-4" />
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="container-editorial py-20 md:py-28">
        <FadeIn>
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Latest Posts</p>
              <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">最新の投稿</h2>
            </div>
            <a href={hamumi.url} target="_blank" rel="noreferrer" className="link-underline pb-1 text-sm tracking-widest text-dusty-brown">
              {hamumi.handle} →
            </a>
          </div>
        </FadeIn>
        <StaggerGroup className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {hamumi.latest.map((p) => (
            <StaggerItem key={p.seed}>
              <a href={hamumi.url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl">
                <div className="transition-transform duration-700 ease-editorial group-hover:scale-110">
                  <EditorialImage seed={p.seed} tone={p.tone} ratio="1 / 1" label="はむみの投稿" />
                </div>
              </a>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import EditorialImage from "@/components/EditorialImage";
import FadeIn from "@/components/motion/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { plushStages, plushProjects } from "@/lib/content/misc";

export const metadata: Metadata = {
  title: "Plush Making",
  description: "アイデアから完成まで。手づくりぬいぐるみができるまでの、六つの工程の記録。",
  alternates: { canonical: "/plush-making" },
};

export default function PlushMakingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Plush Making"
        title="ぬいぐるみができるまで"
        titleEn="From Idea to Companion"
        lead="一枚の布が、そばにいてくれる存在になるまで。手のなかで生まれる、ゆっくりとした六つの工程です。"
      />

      {/* Process stages */}
      <section className="container-editorial py-16 md:py-24">
        <div className="space-y-24 md:space-y-32">
          {plushStages.map((stage, i) => {
            const reversed = i % 2 === 1;
            return (
              <div key={stage.key} className="grid gap-10 md:grid-cols-2 md:items-center">
                <FadeIn className={reversed ? "md:order-2" : ""}>
                  <div className="overflow-hidden rounded-2xl">
                    <EditorialImage seed={stage.seed} tone={stage.tone} ratio="4 / 3" label={stage.title} />
                  </div>
                </FadeIn>
                <FadeIn delay={0.1} className={reversed ? "md:order-1 md:pr-8" : "md:pl-8"}>
                  <span className="font-serif text-5xl italic text-gold-soft">{stage.step}</span>
                  <h2 className="mt-3 font-display text-3xl text-ink">{stage.title}</h2>
                  <p className="mt-5 max-w-md leading-loose text-ink-soft">{stage.body}</p>
                </FadeIn>
              </div>
            );
          })}
        </div>
      </section>

      {/* Archive of projects */}
      <section className="bg-warm-white py-20 md:py-28">
        <div className="container-editorial">
          <FadeIn>
            <p className="eyebrow">Archive</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">これまでの子たち</h2>
            <p className="mt-4 max-w-lg leading-loose text-ink-soft">
              これまでに生まれたぬいぐるみたち。新しい子ができるたび、ここに迎え入れていきます。
            </p>
          </FadeIn>
          <StaggerGroup className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3">
            {plushProjects.map((p) => (
              <StaggerItem key={p.name}>
                <div className="group">
                  <div className="overflow-hidden rounded-2xl">
                    <div className="transition-transform duration-700 ease-editorial group-hover:scale-105">
                      <EditorialImage seed={p.seed} tone={p.tone} ratio="1 / 1" label={p.name} />
                    </div>
                  </div>
                  <div className="mt-5 flex items-baseline justify-between">
                    <h3 className="font-display text-xl text-ink">{p.name}</h3>
                    <span className="font-serif text-sm italic text-dusty-brown">{p.year}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{p.note}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import EditorialImage from "@/components/EditorialImage";
import FadeIn from "@/components/motion/FadeIn";
import { zines } from "@/lib/content/zine";

export const metadata: Metadata = {
  title: "ZINE",
  description: "手づくりの小さな冊子、ZINE。急がない朝、つくったもの、しずかな場所。Honami が綴じた本たち。",
  alternates: { canonical: "/zine" },
};

export default function ZinePage() {
  return (
    <>
      <PageHeader
        eyebrow="ZINE"
        title="手づくりの、小さな本"
        titleEn="Self-published Zines"
        lead="だれに頼まれたわけでもない一冊を、ただ残しておきたくて。写真と言葉と余白で綴じた、手づくりのZINEです。"
      />

      <section className="container-editorial py-16 md:py-24">
        <div className="space-y-24">
          {zines.map((zine, i) => {
            const reversed = i % 2 === 1;
            return (
              <FadeIn key={zine.slug}>
                <Link href={`/zine/${zine.slug}`} className="group grid gap-10 md:grid-cols-12 md:items-center">
                  <div className={`md:col-span-5 ${reversed ? "md:order-2" : ""}`}>
                    <div className="overflow-hidden rounded-sm shadow-xl shadow-dusty-brown/10 transition-transform duration-700 ease-editorial group-hover:-translate-y-1">
                      <EditorialImage seed={zine.cover} tone={zine.tone} ratio="3 / 4" label={`${zine.title} の表紙`} />
                    </div>
                  </div>
                  <div className={`md:col-span-7 ${reversed ? "md:order-1 md:pr-10" : "md:pl-10"}`}>
                    <p className="eyebrow">{zine.issue} ・ {zine.year}</p>
                    <h2 className="mt-4 font-display text-3xl text-ink transition-colors group-hover:text-dusty-brown-deep md:text-4xl">
                      {zine.title}
                    </h2>
                    <p className="mt-2 font-serif text-xl italic text-dusty-brown">{zine.titleEn}</p>
                    <p className="mt-6 max-w-md leading-loose text-ink-soft">{zine.summary}</p>
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-soft">
                      <span>{zine.size}判</span>
                      <span>{zine.pages}ページ</span>
                    </div>
                    <span className="link-underline mt-6 inline-block text-sm tracking-widest text-dusty-brown">
                      この一冊を見る →
                    </span>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </section>
    </>
  );
}

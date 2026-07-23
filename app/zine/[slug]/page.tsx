import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditorialImage from "@/components/EditorialImage";
import Lightbox from "@/components/Lightbox";
import Prose from "@/components/Prose";
import FadeIn from "@/components/motion/FadeIn";
import { getZine, zines } from "@/lib/content/zine";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return zines.map((z) => ({ slug: z.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const zine = getZine(params.slug);
  if (!zine) return {};
  return {
    title: `ZINE — ${zine.title}`,
    description: zine.summary,
    alternates: { canonical: `/zine/${zine.slug}` },
    openGraph: { title: `${zine.title} — ${site.name}`, description: zine.summary, type: "article" },
  };
}

export default function ZineDetailPage({ params }: { params: { slug: string } }) {
  const zine = getZine(params.slug);
  if (!zine) notFound();

  return (
    <article>
      <div className="container-editorial pt-20 md:pt-28">
        <FadeIn>
          <Link href="/zine" className="link-underline text-xs tracking-widest text-dusty-brown">
            ← ZINE
          </Link>
        </FadeIn>
      </div>

      <section className="container-editorial py-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-12 md:items-center">
          <FadeIn className="md:col-span-5">
            <div className="overflow-hidden rounded-sm shadow-2xl shadow-dusty-brown/15">
              <EditorialImage seed={zine.cover} tone={zine.tone} ratio="3 / 4" label={`${zine.title} の表紙`} />
            </div>
          </FadeIn>
          <FadeIn delay={0.1} className="md:col-span-7 md:pl-8">
            <p className="eyebrow">{zine.issue} ・ {zine.year}</p>
            <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">{zine.title}</h1>
            <p className="mt-3 font-serif text-2xl italic text-dusty-brown">{zine.titleEn}</p>
            <p className="mt-7 max-w-md leading-loose text-ink-soft">{zine.summary}</p>
            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-light-gray pt-6">
              {zine.info.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs tracking-widest text-dusty-brown">{row.label}</dt>
                  <dd className="mt-1 text-sm text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </FadeIn>
        </div>
      </section>

      {/* Preview pages */}
      <section className="container-editorial py-16 md:py-24">
        <FadeIn>
          <p className="eyebrow">Preview Pages</p>
          <h2 className="mt-4 font-display text-3xl text-ink">誌面をのぞく</h2>
        </FadeIn>
        <div className="mt-12">
          <Lightbox items={zine.preview} columns="grid-cols-2 md:grid-cols-4" />
        </div>
      </section>

      {/* Story */}
      <section className="bg-warm-white py-20 md:py-28">
        <div className="container-editorial">
          <div className="grid gap-12 md:grid-cols-12">
            <FadeIn className="md:col-span-4">
              <p className="eyebrow">Story Behind</p>
              <h2 className="mt-4 font-display text-2xl leading-relaxed text-ink">この本のこと</h2>
            </FadeIn>
            <FadeIn delay={0.1} className="md:col-span-8">
              <Prose paragraphs={zine.story} />
            </FadeIn>
          </div>
        </div>
      </section>
    </article>
  );
}

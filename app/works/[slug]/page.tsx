import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditorialImage from "@/components/EditorialImage";
import Lightbox from "@/components/Lightbox";
import WorkCard from "@/components/WorkCard";
import Prose from "@/components/Prose";
import FadeIn from "@/components/motion/FadeIn";
import { getWork, relatedWorks, workCategories, works } from "@/lib/content/works";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const work = getWork(params.slug);
  if (!work) return {};
  return {
    title: work.title,
    description: work.summary,
    alternates: { canonical: `/works/${work.slug}` },
    openGraph: { title: `${work.title} — ${site.name}`, description: work.summary, type: "article" },
  };
}

export default function WorkDetailPage({ params }: { params: { slug: string } }) {
  const work = getWork(params.slug);
  if (!work) notFound();

  const cat = workCategories.find((c) => c.key === work.category);
  const related = relatedWorks(work.slug, work.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: work.title,
    alternateName: work.titleEn,
    dateCreated: work.year,
    creator: { "@type": "Person", name: site.author },
    description: work.summary,
    genre: cat?.label,
  };

  return (
    <article>
      {/* Hero */}
      <div className="container-editorial pt-20 md:pt-28">
        <FadeIn>
          <Link href="/works" className="link-underline text-xs tracking-widest text-dusty-brown">
            ← Works
          </Link>
        </FadeIn>
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <FadeIn>
              <p className="eyebrow">{cat?.labelJa} ・ {work.year}</p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl">{work.title}</h1>
            </FadeIn>
            <FadeIn delay={0.14}>
              <p className="mt-3 font-serif text-xl italic text-dusty-brown">{work.titleEn}</p>
            </FadeIn>
          </div>
          {work.materials && (
            <FadeIn delay={0.2}>
              <ul className="text-sm text-ink-soft md:text-right">
                {work.materials.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </FadeIn>
          )}
        </div>
      </div>

      <FadeIn delay={0.1}>
        <div className="container-editorial mt-12">
          <div className="overflow-hidden rounded-2xl">
            <EditorialImage seed={work.slug} tone={work.tone} ratio="16 / 9" label={work.title} />
          </div>
        </div>
      </FadeIn>

      {/* Description */}
      <section className="container-editorial py-20 md:py-28">
        <div className="grid gap-14 md:grid-cols-12">
          <FadeIn className="md:col-span-4">
            <p className="eyebrow">About the Work</p>
            <p className="mt-4 font-display text-xl leading-relaxed text-ink">{work.summary}</p>
          </FadeIn>
          <FadeIn delay={0.1} className="md:col-span-8">
            <Prose paragraphs={work.description} />
          </FadeIn>
        </div>
      </section>

      {/* Process */}
      <section className="bg-warm-white py-20 md:py-28">
        <div className="container-editorial">
          <FadeIn>
            <p className="eyebrow">Process</p>
            <h2 className="mt-4 font-display text-3xl text-ink">つくりかた</h2>
          </FadeIn>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {work.process.map((p, i) => (
              <FadeIn key={p.step} delay={i * 0.08}>
                <div className="border-t border-light-gray pt-6">
                  <span className="font-serif text-2xl italic text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-display text-lg text-ink">{p.step}</h3>
                  <p className="mt-3 text-sm leading-loose text-ink-soft">{p.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-editorial py-20 md:py-28">
        <FadeIn>
          <p className="eyebrow">Gallery</p>
          <h2 className="mt-4 font-display text-3xl text-ink">ギャラリー</h2>
        </FadeIn>
        <div className="mt-12">
          <Lightbox items={work.gallery} columns="grid-cols-2 md:grid-cols-4" />
        </div>
      </section>

      {/* Related */}
      <section className="bg-warm-white py-20 md:py-28">
        <div className="container-editorial">
          <FadeIn>
            <p className="eyebrow">Related</p>
            <h2 className="mt-4 font-display text-3xl text-ink">関連する作品</h2>
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3">
            {related.map((w) => (
              <WorkCard key={w.slug} work={w} />
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}

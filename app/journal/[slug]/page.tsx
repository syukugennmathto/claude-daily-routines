import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditorialImage from "@/components/EditorialImage";
import Lightbox from "@/components/Lightbox";
import JournalCard from "@/components/JournalCard";
import FadeIn from "@/components/motion/FadeIn";
import { formatDate, getPost, journal, journalCategories, relatedPosts } from "@/lib/content/journal";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return journal.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      title: `${post.title} — ${site.name}`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default function JournalDetailPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const cat = journalCategories.find((c) => c.key === post.category);
  const related = relatedPosts(post.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    author: { "@type": "Person", name: site.author },
    publisher: { "@type": "Person", name: site.author },
    description: post.excerpt,
    articleSection: cat?.label,
  };

  return (
    <article>
      {/* Header */}
      <div className="container-editorial pt-20 md:pt-28">
        <FadeIn>
          <Link href="/journal" className="link-underline text-xs tracking-widest text-dusty-brown">
            ← Journal
          </Link>
        </FadeIn>
        <div className="mx-auto mt-10 max-w-3xl text-center">
          <FadeIn>
            <div className="flex items-center justify-center gap-3 text-xs tracking-widest text-dusty-brown">
              <span>{cat?.label}</span>
              <span className="h-3 w-px bg-light-gray" />
              <span className="font-serif italic">{formatDate(post.date)}</span>
              <span className="h-3 w-px bg-light-gray" />
              <span>{post.readMinutes} min read</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-6 font-display text-4xl leading-tight text-ink md:text-5xl">{post.title}</h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mx-auto mt-6 max-w-xl leading-loose text-ink-soft">{post.excerpt}</p>
          </FadeIn>
        </div>
      </div>

      {/* Cover */}
      <FadeIn delay={0.1}>
        <div className="container-editorial mt-14">
          <div className="overflow-hidden rounded-2xl">
            <EditorialImage seed={`journal-${post.slug}`} tone={post.tone} ratio="16 / 9" label={post.title} />
          </div>
        </div>
      </FadeIn>

      {/* Body */}
      <section className="container-editorial py-20 md:py-24">
        <div className="prose-editorial mx-auto max-w-reading text-[15px] md:text-base">
          {post.body.map((para, i) => (
            <FadeIn key={i} as="div">
              <p>{para}</p>
            </FadeIn>
          ))}
        </div>

        {post.gallery && post.gallery.length > 0 && (
          <div className="mx-auto mt-14 max-w-4xl">
            <Lightbox items={post.gallery} columns="grid-cols-1 sm:grid-cols-3" />
          </div>
        )}
      </section>

      {/* Related */}
      <section className="bg-warm-white py-20 md:py-28">
        <div className="container-editorial">
          <FadeIn>
            <p className="eyebrow">Keep Reading</p>
            <h2 className="mt-4 font-display text-3xl text-ink">つづけて読む</h2>
          </FadeIn>
          <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
            {related.map((p) => (
              <JournalCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}

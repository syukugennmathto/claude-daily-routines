import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import EditorialImage from "@/components/EditorialImage";
import FadeIn from "@/components/motion/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { lemon8 } from "@/lib/content/misc";

export const metadata: Metadata = {
  title: "Lemon8",
  description: "部屋づくり、文具、DIY、創作のあれこれ。Lemon8で発信している、雑誌のような特集記事。",
  alternates: { canonical: "/lemon8" },
};

export default function Lemon8Page() {
  const [lead, ...rest] = lemon8.articles;
  return (
    <>
      <PageHeader
        eyebrow="Lemon8"
        title="暮らしの特集"
        titleEn="Little Features"
        lead={lemon8.lead}
      />

      {/* Lead article */}
      <section className="container-editorial py-16 md:py-20">
        <FadeIn>
          <a href={lemon8.url} target="_blank" rel="noreferrer" className="group grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <div className="overflow-hidden rounded-2xl">
                <div className="transition-transform duration-700 ease-editorial group-hover:scale-[1.03]">
                  <EditorialImage seed={lead.seed} tone={lead.tone} ratio="16 / 10" label={lead.title} />
                </div>
              </div>
            </div>
            <div className="md:col-span-5">
              <p className="eyebrow">{lead.topic} ・ Featured</p>
              <h2 className="mt-4 font-display text-3xl leading-snug text-ink transition-colors group-hover:text-dusty-brown-deep md:text-4xl">
                {lead.title}
              </h2>
              <p className="mt-5 max-w-md leading-loose text-ink-soft">{lead.summary}</p>
              <span className="link-underline mt-6 inline-block text-sm tracking-widest text-dusty-brown">
                Lemon8で読む →
              </span>
            </div>
          </a>
        </FadeIn>
      </section>

      {/* Grid of articles */}
      <section className="container-editorial pb-24">
        <StaggerGroup className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <StaggerItem key={a.title}>
              <a href={lemon8.url} target="_blank" rel="noreferrer" className="group block">
                <div className="overflow-hidden rounded-2xl">
                  <div className="transition-transform duration-700 ease-editorial group-hover:scale-[1.04]">
                    <EditorialImage seed={a.seed} tone={a.tone} ratio="4 / 3" label={a.title} />
                  </div>
                </div>
                <p className="mt-5 text-xs tracking-widest text-dusty-brown">{a.topic}</p>
                <h3 className="mt-2 font-display text-xl leading-snug text-ink transition-colors group-hover:text-dusty-brown-deep">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.summary}</p>
              </a>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </>
  );
}

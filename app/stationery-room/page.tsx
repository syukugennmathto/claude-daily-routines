import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import EditorialImage from "@/components/EditorialImage";
import Lightbox from "@/components/Lightbox";
import Prose from "@/components/Prose";
import FadeIn from "@/components/motion/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { stationery } from "@/lib/content/misc";

export const metadata: Metadata = {
  title: "stationery_room",
  description: "文具、机まわり、収納、インテリア。使うたびに心が整う、創作の部屋のこと。@stationery_room_",
  alternates: { canonical: "/stationery-room" },
};

export default function StationeryRoomPage() {
  return (
    <>
      <PageHeader
        eyebrow="stationery_room"
        title="文具の部屋"
        titleEn="A Room for Making"
        lead={stationery.lead}
      />

      {/* Editorial opening */}
      <section className="container-editorial py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-12 md:items-center">
          <FadeIn className="md:col-span-7">
            <div className="overflow-hidden rounded-2xl">
              <EditorialImage seed="stationery-hero" tone="gold" ratio="16 / 10" label="文具の部屋" />
            </div>
          </FadeIn>
          <FadeIn delay={0.1} className="md:col-span-5">
            <p className="eyebrow">The Room</p>
            <h2 className="mt-4 font-display text-2xl leading-relaxed text-ink">整った机は、整った心。</h2>
            <Prose className="mt-6" paragraphs={stationery.intro} />
            <a href={stationery.url} target="_blank" rel="noreferrer" className="link-underline mt-6 inline-block text-sm tracking-widest text-dusty-brown">
              Instagram {stationery.handle} →
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Feature blocks */}
      <section className="bg-warm-white py-20 md:py-28">
        <div className="container-editorial">
          <FadeIn>
            <p className="eyebrow">Features</p>
            <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">部屋を、めぐる</h2>
          </FadeIn>
          <StaggerGroup className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {stationery.features.map((f) => (
              <StaggerItem key={f.title}>
                <div className="group">
                  <div className="overflow-hidden rounded-2xl">
                    <div className="transition-transform duration-700 ease-editorial group-hover:scale-105">
                      <EditorialImage seed={f.seed} tone={f.tone} ratio="4 / 3" label={f.title} />
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-xl text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-loose text-ink-soft">{f.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-editorial py-20 md:py-28">
        <FadeIn>
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">The Desk, Daily</p>
              <h2 className="mt-4 font-display text-3xl text-ink md:text-4xl">机の上の、日々</h2>
            </div>
            <a href={stationery.url} target="_blank" rel="noreferrer" className="link-underline pb-1 text-sm tracking-widest text-dusty-brown">
              {stationery.handle} →
            </a>
          </div>
        </FadeIn>
        <div className="mt-12">
          <Lightbox
            items={stationery.gallery.map((g) => ({ seed: g.seed, tone: g.tone }))}
            columns="grid-cols-2 md:grid-cols-4"
          />
        </div>
      </section>
    </>
  );
}

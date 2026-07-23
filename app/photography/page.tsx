import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import PhotoGallery from "@/components/PhotoGallery";
import FadeIn from "@/components/motion/FadeIn";
import { photography } from "@/lib/content/misc";

export const metadata: Metadata = {
  title: "Photography",
  description: "人物、自然、喫茶、花、旅、日々。光を待って撮りためた、フィルムの写真たち。@honami.photo",
  alternates: { canonical: "/photography" },
};

export default function PhotographyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Photography"
        title="写真"
        titleEn="Waiting for the Light"
        lead={photography.lead}
      />
      <div className="container-editorial pt-8">
        <FadeIn>
          <a href={photography.url} target="_blank" rel="noreferrer" className="link-underline text-sm tracking-widest text-dusty-brown">
            Instagram {photography.handle} →
          </a>
        </FadeIn>
      </div>
      <section className="container-editorial py-16 md:py-20">
        <PhotoGallery />
      </section>
    </>
  );
}

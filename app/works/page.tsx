import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import WorksGallery from "@/components/WorksGallery";

export const metadata: Metadata = {
  title: "Works",
  description: "イラスト、デザイン、ぬいぐるみ、グッズ、写真。Honami がつくってきた作品のギャラリー。",
  alternates: { canonical: "/works" },
};

export default function WorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Works"
        title="つくったもの"
        titleEn="Selected Works"
        lead="これまでにつくってきたものを、カテゴリーごとに。ひとつひとつに、小さな物語があります。"
      />
      <section className="container-editorial py-16 md:py-20">
        <WorksGallery />
      </section>
    </>
  );
}

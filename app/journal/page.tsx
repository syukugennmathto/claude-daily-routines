import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import JournalCard from "@/components/JournalCard";
import FadeIn from "@/components/motion/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { sortedJournal } from "@/lib/content/journal";

export const metadata: Metadata = {
  title: "Journal",
  description: "つくることのまわりで考えたこと。制作の記録、文具のこと、旅や展示のはなし。長めの読みものです。",
  alternates: { canonical: "/journal" },
};

export default function JournalPage() {
  const [lead, ...rest] = sortedJournal;
  return (
    <>
      <PageHeader
        eyebrow="Journal"
        title="日記"
        titleEn="The Long Read"
        lead="つくることのまわりで、考えたこと・気づいたこと。この場所の、心臓のようなページです。"
      />

      {/* Lead story */}
      <section className="container-editorial py-16 md:py-20">
        <FadeIn>
          <JournalCard post={lead} size="lg" />
        </FadeIn>
      </section>

      {/* Rest */}
      <section className="container-editorial pb-24">
        <div className="rule mb-16" />
        <StaggerGroup className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <StaggerItem key={post.slug}>
              <JournalCard post={post} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>
    </>
  );
}

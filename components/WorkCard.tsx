import Link from "next/link";
import EditorialImage from "@/components/EditorialImage";
import type { Work } from "@/lib/content/works";
import { workCategories } from "@/lib/content/works";

export default function WorkCard({ work, ratio = "4 / 5" }: { work: Work; ratio?: string }) {
  const cat = workCategories.find((c) => c.key === work.category);
  return (
    <Link href={`/works/${work.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl">
        <div className="transition-transform duration-700 ease-editorial group-hover:scale-[1.03]">
          <EditorialImage seed={work.slug} tone={work.tone} ratio={ratio} label={work.title} />
        </div>
      </div>
      <div className="mt-5">
        <div className="flex items-center gap-3 text-xs tracking-widest text-dusty-brown">
          <span>{cat?.labelJa}</span>
          <span className="h-3 w-px bg-light-gray" />
          <span className="font-serif italic">{work.year}</span>
        </div>
        <h3 className="mt-2 font-display text-xl text-ink transition-colors group-hover:text-dusty-brown-deep">
          {work.title}
        </h3>
        <p className="mt-1 font-serif text-sm italic text-ink-soft">{work.titleEn}</p>
      </div>
    </Link>
  );
}

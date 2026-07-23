import Link from "next/link";
import EditorialImage from "@/components/EditorialImage";
import { formatDate, journalCategories, type JournalPost } from "@/lib/content/journal";

export default function JournalCard({ post, size = "md" }: { post: JournalPost; size?: "md" | "lg" }) {
  const cat = journalCategories.find((c) => c.key === post.category);
  return (
    <Link href={`/journal/${post.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl">
        <div className="transition-transform duration-700 ease-editorial group-hover:scale-[1.03]">
          <EditorialImage
            seed={`journal-${post.slug}`}
            tone={post.tone}
            ratio={size === "lg" ? "16 / 10" : "3 / 2"}
            label={post.title}
          />
        </div>
      </div>
      <div className="mt-5">
        <div className="flex items-center gap-3 text-xs tracking-widest text-dusty-brown">
          <span>{cat?.label}</span>
          <span className="h-3 w-px bg-light-gray" />
          <span className="font-serif italic">{formatDate(post.date)}</span>
          <span className="h-3 w-px bg-light-gray" />
          <span>{post.readMinutes} min</span>
        </div>
        <h3
          className={`mt-3 font-display text-ink transition-colors group-hover:text-dusty-brown-deep ${
            size === "lg" ? "text-2xl md:text-3xl" : "text-xl"
          }`}
        >
          {post.title}
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
      </div>
    </Link>
  );
}

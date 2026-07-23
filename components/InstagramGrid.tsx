import EditorialImage from "@/components/EditorialImage";
import { instagramFeed } from "@/lib/content/misc";

export default function InstagramGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      {instagramFeed.map((post) => (
        <a
          key={post.seed}
          href="https://instagram.com/honami.photo"
          target="_blank"
          rel="noreferrer"
          className="group relative block overflow-hidden rounded-xl"
        >
          <div className="transition-transform duration-700 ease-editorial group-hover:scale-110">
            <EditorialImage seed={post.seed} tone={post.tone} ratio="1 / 1" label="Instagramの投稿" />
          </div>
          <span className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/50 to-transparent p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <span className="text-[10px] tracking-widest text-ivory">{post.account}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

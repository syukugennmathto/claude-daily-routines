import Link from "next/link";
import FadeIn from "@/components/motion/FadeIn";

type Props = {
  eyebrow: string;
  title: string;
  href?: string;
  hrefLabel?: string;
};

export default function SectionHeading({ eyebrow, title, href, hrefLabel = "すべて見る" }: Props) {
  return (
    <FadeIn>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">{title}</h2>
        </div>
        {href && (
          <Link href={href} className="link-underline shrink-0 pb-1 text-sm tracking-widest text-dusty-brown">
            {hrefLabel} →
          </Link>
        )}
      </div>
    </FadeIn>
  );
}

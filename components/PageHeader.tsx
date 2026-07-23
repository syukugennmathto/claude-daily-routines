import FadeIn from "@/components/motion/FadeIn";

type Props = {
  eyebrow: string;
  title: string;
  titleEn?: string;
  lead?: string;
  align?: "left" | "center";
};

export default function PageHeader({ eyebrow, title, titleEn, lead, align = "left" }: Props) {
  const centered = align === "center";
  return (
    <header
      className={`container-editorial pt-20 md:pt-28 ${centered ? "text-center" : ""}`}
    >
      <div className={centered ? "mx-auto max-w-2xl" : "max-w-3xl"}>
        <FadeIn>
          <p className="eyebrow">{eyebrow}</p>
        </FadeIn>
        <FadeIn delay={0.08}>
          <h1 className="mt-5 font-display text-4xl leading-tight text-ink md:text-6xl">
            {title}
          </h1>
        </FadeIn>
        {titleEn && (
          <FadeIn delay={0.14}>
            <p className="mt-3 font-serif text-xl italic tracking-wide text-dusty-brown md:text-2xl">
              {titleEn}
            </p>
          </FadeIn>
        )}
        {lead && (
          <FadeIn delay={0.2}>
            <p className={`mt-7 text-base leading-loose text-ink-soft md:text-lg ${centered ? "mx-auto" : ""}`}>
              {lead}
            </p>
          </FadeIn>
        )}
      </div>
      <FadeIn delay={0.28}>
        <div className="rule mt-14" />
      </FadeIn>
    </header>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-editorial flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-6 font-display text-4xl text-ink md:text-5xl">迷子になったみたいです</h1>
      <p className="mt-6 max-w-md leading-loose text-ink-soft">
        お探しのページは、見つかりませんでした。ひとやすみして、はじめのページに戻りましょう。
      </p>
      <Link
        href="/"
        className="group mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 text-sm tracking-widest text-ivory transition-colors hover:bg-dusty-brown-deep"
      >
        ホームへ戻る
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}

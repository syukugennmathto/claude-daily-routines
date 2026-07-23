import Link from "next/link";
import { nav, site } from "@/lib/site";

export default function Footer() {
  const year = 2026;
  return (
    <footer className="mt-32 border-t border-light-gray bg-warm-white">
      <div className="container-editorial py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-serif text-3xl tracking-[0.12em] text-ink">Honami</p>
            <p className="mt-5 max-w-sm text-sm leading-loose text-ink-soft">{site.tagline}</p>
            <a
              href={`mailto:${site.email}`}
              className="link-underline mt-6 inline-block font-serif text-lg italic text-dusty-brown"
            >
              {site.email}
            </a>
          </div>

          <nav className="md:col-span-4" aria-label="フッターナビゲーション">
            <p className="eyebrow mb-5">Index</p>
            <ul className="grid grid-cols-2 gap-y-2 text-sm text-ink-soft">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="eyebrow mb-5">Elsewhere</p>
            <ul className="flex flex-col gap-2 text-sm text-ink-soft">
              {site.socials.map((s) => (
                <li key={s.handle}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="link-underline">
                    <span className="text-dusty-brown">{s.label}</span> · {s.handle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-light-gray pt-8 text-xs tracking-wide text-dusty-brown sm:flex-row sm:items-center">
          <p>© {year} Honami. すべての作品と写真の著作権は制作者に帰属します。</p>
          <p className="font-serif italic">Made slowly, with care.</p>
        </div>
      </div>
    </footer>
  );
}

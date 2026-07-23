"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { nav, site } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-ivory/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-editorial flex items-center justify-between py-5">
        <Link href="/" className="group flex flex-col leading-none" aria-label="Honami ホームへ">
          <span className="font-serif text-2xl tracking-[0.14em] text-ink">Honami</span>
          <span className="mt-0.5 text-[10px] tracking-[0.36em] text-dusty-brown">STUDIO ・ JOURNAL</span>
        </Link>

        {/* Desktop nav — a quiet, editorial row */}
        <nav className="hidden items-center gap-6 xl:flex" aria-label="メインナビゲーション">
          {nav.slice(1).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`link-underline text-[13px] tracking-wide transition-colors ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <span className="text-xs tracking-[0.3em] text-ink-soft">{open ? "CLOSE" : "MENU"}</span>
          <span className="relative flex h-4 w-6 flex-col justify-between">
            <span className={`h-px w-full bg-ink transition-transform duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`h-px w-full bg-ink transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`h-px w-full bg-ink transition-transform duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 top-0 z-40 h-[100dvh] overflow-y-auto bg-ivory xl:hidden"
          >
            <div className="container-editorial flex min-h-full flex-col justify-center py-28">
              <p className="eyebrow mb-8">Index</p>
              <ul className="flex flex-col gap-1">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={item.href}
                      className="group flex items-baseline justify-between border-b border-light-gray/70 py-4"
                    >
                      <span className="font-display text-2xl text-ink">{item.label}</span>
                      <span className="text-xs tracking-widest text-dusty-brown">{item.labelJa}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-widest text-dusty-brown">
                {site.socials.map((s) => (
                  <a key={s.handle} href={s.url} target="_blank" rel="noreferrer" className="link-underline">
                    {s.handle}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

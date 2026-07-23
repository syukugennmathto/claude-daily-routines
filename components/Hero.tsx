"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import EditorialImage from "@/components/EditorialImage";
import { site } from "@/lib/site";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "16%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[92vh] min-h-[560px] w-full overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <EditorialImage seed="hero-home" tone="warm" ratio="auto" className="h-full w-full" label="Honami のアトリエ" priority />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-ivory/85 via-ivory/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-ivory/20 via-transparent to-ivory/55" />

      <motion.div style={{ opacity: fade }} className="container-editorial relative flex h-full flex-col justify-end pb-20 md:justify-center md:pb-0">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow"
          >
            Illustration ・ Handmade ・ Slow Living
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-4xl leading-[1.25] text-ink sm:text-5xl md:text-6xl"
          >
            暮らしから、<br />うまれるものたち。
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-md text-base leading-loose text-ink-soft md:text-lg"
          >
            {site.tagline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <Link
              href="/works"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 text-sm tracking-widest text-ivory transition-colors hover:bg-dusty-brown-deep"
            >
              作品を見る
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link href="/about" className="link-underline text-sm tracking-widest text-ink">
              わたしについて
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: fade }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="text-[10px] tracking-[0.3em] text-dusty-brown">SCROLL</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="h-8 w-px bg-dusty-brown/50"
        />
      </motion.div>
    </section>
  );
}

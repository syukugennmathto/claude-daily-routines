"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EditorialImage from "@/components/EditorialImage";

export type LightItem = { seed: string; caption?: string; tone?: string; ratio?: string };

export default function Lightbox({
  items,
  columns = "grid-cols-2 md:grid-cols-3",
  masonry = false,
}: {
  items: LightItem[];
  columns?: string;
  masonry?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const next = useCallback(
    () => setActive((i) => (i === null ? null : (i + 1) % items.length)),
    [items.length]
  );
  const prev = useCallback(
    () => setActive((i) => (i === null ? null : (i - 1 + items.length) % items.length)),
    [items.length]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, next, prev]);

  if (masonry) {
    return (
      <>
        <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
          {items.map((item, i) => (
            <Thumb key={item.seed} item={item} onClick={() => setActive(i)} />
          ))}
        </div>
        <Modal items={items} active={active} close={close} next={next} prev={prev} />
      </>
    );
  }

  return (
    <>
      <div className={`grid gap-4 ${columns}`}>
        {items.map((item, i) => (
          <Thumb key={item.seed} item={item} onClick={() => setActive(i)} />
        ))}
      </div>
      <Modal items={items} active={active} close={close} next={next} prev={prev} />
    </>
  );
}

function Thumb({ item, onClick }: { item: LightItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full overflow-hidden rounded-xl text-left"
      aria-label={item.caption ? `${item.caption} を拡大` : "画像を拡大"}
    >
      <div className="transition-transform duration-700 ease-editorial group-hover:scale-[1.04]">
        <EditorialImage seed={item.seed} tone={item.tone} ratio={item.ratio ?? "1 / 1"} label={item.caption} />
      </div>
      {item.caption && (
        <span className="mt-2 block px-0.5 text-xs tracking-wide text-dusty-brown">{item.caption}</span>
      )}
    </button>
  );
}

function Modal({
  items,
  active,
  close,
  next,
  prev,
}: {
  items: LightItem[];
  active: number | null;
  close: () => void;
  next: () => void;
  prev: () => void;
}) {
  return (
    <AnimatePresence>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 backdrop-blur-sm p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-5 top-5 text-xs tracking-[0.3em] text-ivory/80 hover:text-ivory"
          >
            CLOSE ✕
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 px-3 py-6 text-2xl text-ivory/70 hover:text-ivory"
            aria-label="前へ"
          >
            ‹
          </button>
          <motion.figure
            key={active}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[86vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <EditorialImage
                seed={items[active].seed}
                tone={items[active].tone}
                ratio={items[active].ratio ?? "3 / 2"}
                label={items[active].caption}
              />
            </div>
            {items[active].caption && (
              <figcaption className="mt-4 text-center font-serif text-sm italic text-ivory/80">
                {items[active].caption}
              </figcaption>
            )}
          </motion.figure>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-6 text-2xl text-ivory/70 hover:text-ivory"
            aria-label="次へ"
          >
            ›
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

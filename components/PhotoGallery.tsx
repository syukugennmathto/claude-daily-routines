"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Lightbox from "@/components/Lightbox";
import { photography, photoCategories, type PhotoCategory } from "@/lib/content/misc";

type Filter = PhotoCategory | "all";

export default function PhotoGallery() {
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo(() => {
    const list = filter === "all" ? photography.photos : photography.photos.filter((p) => p.category === filter);
    return list.map((p) => ({ seed: p.seed, caption: p.caption, tone: p.tone, ratio: p.ratio }));
  }, [filter]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "すべて" },
    ...photoCategories.map((c) => ({ key: c.key as Filter, label: c.labelJa })),
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`relative pb-1 text-sm tracking-wide transition-colors ${
                active ? "text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {f.label}
              {active && <motion.span layoutId="photo-underline" className="absolute -bottom-px left-0 h-px w-full bg-gold" />}
            </button>
          );
        })}
      </div>

      <div className="mt-12">
        <Lightbox items={items} masonry />
      </div>
    </div>
  );
}

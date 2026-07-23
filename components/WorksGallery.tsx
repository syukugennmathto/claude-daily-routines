"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WorkCard from "@/components/WorkCard";
import { works, workCategories, type WorkCategory } from "@/lib/content/works";

type Filter = WorkCategory | "all";

export default function WorksGallery() {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = filter === "all" ? works : works.filter((w) => w.category === filter);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "すべて" },
    ...workCategories.map((c) => ({ key: c.key as Filter, label: c.labelJa })),
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
              {active && (
                <motion.span
                  layoutId="works-underline"
                  className="absolute -bottom-px left-0 h-px w-full bg-gold"
                />
              )}
            </button>
          );
        })}
      </div>

      <motion.div layout className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((work) => (
            <motion.div
              key={work.slug}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <WorkCard work={work} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

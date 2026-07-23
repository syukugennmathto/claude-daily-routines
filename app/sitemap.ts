import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { works } from "@/lib/content/works";
import { journal } from "@/lib/content/journal";
import { zines } from "@/lib/content/zine";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const routes = [
    "",
    "/about",
    "/works",
    "/plush-making",
    "/zine",
    "/hamumi-diary",
    "/stationery-room",
    "/photography",
    "/lemon8",
    "/journal",
    "/contact",
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/journal" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  const workEntries: MetadataRoute.Sitemap = works.map((w) => ({
    url: `${base}/works/${w.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const journalEntries: MetadataRoute.Sitemap = journal.map((p) => ({
    url: `${base}/journal/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const zineEntries: MetadataRoute.Sitemap = zines.map((z) => ({
    url: `${base}/zine/${z.slug}`,
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticEntries, ...workEntries, ...journalEntries, ...zineEntries];
}

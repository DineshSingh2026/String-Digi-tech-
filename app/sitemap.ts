import type { MetadataRoute } from "next";
import { company, legal, solutions } from "@/content/copy";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...Object.keys(solutions).map((s) => `/solutions/${s}`),
    "/financial-technology",
    "/approach",
    "/about",
    "/contact",
    ...Object.keys(legal).map((s) => `/legal/${s}`),
  ];
  const now = new Date();
  return paths.map((p) => ({
    url: new URL(p, company.url).toString(),
    lastModified: now,
    changeFrequency: "monthly",
    priority: p === "/" ? 1 : p.startsWith("/legal") ? 0.3 : 0.7,
  }));
}

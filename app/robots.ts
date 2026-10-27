import type { MetadataRoute } from "next";
import { company } from "@/content/copy";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/_lab/", "/api/"] }],
    sitemap: `${company.url}/sitemap.xml`,
  };
}

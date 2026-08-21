import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about", "/privacy", "/terms", "/contact"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date("2026-08-21"),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}

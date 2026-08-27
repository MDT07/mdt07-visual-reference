import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { deploymentConfig } from "@/lib/deployment";
import { listPublicBoards } from "@/lib/store/public-catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (deploymentConfig.isAdmin) return [];

  const staticRoutes = ["/", "/boards", "/about", "/privacy", "/terms", "/contact"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date("2026-08-28"),
    changeFrequency: path === "/" || path === "/boards" ? "weekly" as const : "monthly" as const,
    priority: path === "/" ? 1 : path === "/boards" ? 0.9 : 0.7,
  }));
  const boards = await listPublicBoards();
  const boardRoutes = boards.map((board) => ({
    url: `${siteConfig.url}/boards/${board.id}`,
    lastModified: new Date(board.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...boardRoutes];
}

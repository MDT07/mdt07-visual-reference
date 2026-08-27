import { deploymentConfig } from "@/lib/deployment";
import { isValidPinterestRedirectUri } from "@/lib/pinterest/redirect-policy";

export const siteConfig = {
  name: "MDT07 Visual Reference",
  description:
    "A curated visual reference library for discovering stronger directions for web design and development projects.",
  contactEmail: "emirsemenov@yahoo.com",
  githubUrl: "https://github.com/MDT07",
  githubUsername: "MDT07",
  domain:
    process.env.SITE_DOMAIN ?? new URL(deploymentConfig.publicUrl).hostname,
  url: deploymentConfig.publicUrl,
} as const;

export type SiteConfig = typeof siteConfig;

export function getPublicUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}

export const pinterestConfig = {
  appId: process.env.PINTEREST_APP_ID?.trim() ?? "",
  appSecret: process.env.PINTEREST_APP_SECRET?.trim() ?? "",
  redirectUri: process.env.PINTEREST_REDIRECT_URI?.trim() ?? "",
  sessionSecret: process.env.PINTEREST_SESSION_SECRET ?? "",
  apiBase: process.env.PINTEREST_API_BASE ?? "https://api.pinterest.com/v5",
  searchPageSize: Number(process.env.PINTEREST_SEARCH_PAGE_SIZE ?? 25),
  scopes: ["boards:read", "pins:read"] as const,
} as const;

export const isPinterestConfigured = (): boolean =>
  Boolean(
      deploymentConfig.isAdmin &&
      process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SECRET_KEY?.trim().startsWith("sb_secret_") &&
      pinterestConfig.appId &&
      pinterestConfig.appSecret &&
      pinterestConfig.redirectUri &&
      pinterestConfig.sessionSecret.length >= 32 &&
      isValidPinterestRedirectUri(
        pinterestConfig.redirectUri,
        deploymentConfig.appUrl
      )
  );

export function assertPinterestConfigured(): void {
  if (!isPinterestConfigured()) {
    throw new Error(
      "Pinterest OAuth is not configured for admin mode. Set APP_MODE=admin, server-only Supabase credentials, Pinterest credentials, PINTEREST_SESSION_SECRET, and an exact PINTEREST_REDIRECT_URI on APP_URL at /api/pinterest/auth/callback."
    );
  }
}

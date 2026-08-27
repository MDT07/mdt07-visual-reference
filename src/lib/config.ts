import { deploymentConfig } from "@/lib/deployment";
import { isValidPinterestRedirectUri } from "@/lib/pinterest/redirect-policy";

export const siteConfig = {
  name: "MDT07 Visual Reference",
  description:
    "A project-scoped visual research workspace that ranks Pins from public boards available to a connected Pinterest account and links to their original sources.",
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

export const agentApiConfig = {
  enabled:
    deploymentConfig.isStudio && process.env.AGENT_API_ENABLED === "true",
  apiKey: process.env.AGENT_API_KEY ?? "",
} as const;

export const aiCatalogConfig = {
  enabled:
    deploymentConfig.isStudio && process.env.AI_CATALOG_ENABLED === "true",
  provider: "OpenRouter",
  apiKey: process.env.OPENROUTER_API_KEY?.trim() ?? "",
  model: process.env.OPENROUTER_MODEL?.trim() || "z-ai/glm-5.2:free",
  maxReferences: Math.max(
    1,
    Math.min(100, Number(process.env.AI_CATALOG_MAX_REFERENCES ?? 50) || 50)
  ),
} as const;

export const isAiCatalogConfigured = (): boolean =>
  Boolean(aiCatalogConfig.enabled && aiCatalogConfig.apiKey.length >= 20);

export const isPinterestConfigured = (): boolean =>
  Boolean(
      deploymentConfig.isStudio &&
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
      "Pinterest OAuth is not configured for studio mode. Set APP_MODE=studio, server-only Supabase credentials, Pinterest credentials, PINTEREST_SESSION_SECRET, and an exact PINTEREST_REDIRECT_URI on APP_URL at /api/pinterest/auth/callback."
    );
  }
}

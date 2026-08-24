const siteUrl = (
  process.env.SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://mdt07-visual-reference.vercel.app"
    : "http://localhost:3000")
).replace(/\/$/, "");

export const siteConfig = {
  name: "MDT07 Visual Reference",
  description:
    "A project-scoped visual research workspace that ranks Pins from public boards available to a connected Pinterest account and links to their original sources.",
  contactEmail: "emirsemenov@yahoo.com",
  githubUrl: "https://github.com/MDT07",
  githubUsername: "MDT07",
  domain: process.env.SITE_DOMAIN ?? new URL(siteUrl).hostname,
  url: siteUrl,
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
  enabled: process.env.AGENT_API_ENABLED === "true",
  apiKey: process.env.AGENT_API_KEY ?? "",
} as const;

export const isPinterestConfigured = (): boolean =>
  Boolean(
      pinterestConfig.appId &&
      pinterestConfig.appSecret &&
      pinterestConfig.redirectUri &&
      pinterestConfig.sessionSecret
  );

export function assertPinterestConfigured(): void {
  if (!isPinterestConfigured()) {
    throw new Error(
      "Pinterest OAuth is not configured. Set PINTEREST_APP_ID, PINTEREST_APP_SECRET, PINTEREST_REDIRECT_URI, and PINTEREST_SESSION_SECRET."
    );
  }
}

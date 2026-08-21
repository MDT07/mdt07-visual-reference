const siteUrl = (
  process.env.SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://pinterest-integration.vercel.app"
    : "http://localhost:3000")
).replace(/\/$/, "");

export const siteConfig = {
  name: "MDT07 Pinterest Reference",
  description:
    "A web tool for discovering and exploring Pinterest visual references for web design and development projects.",
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
  appId: process.env.PINTEREST_APP_ID ?? "",
  appSecret: process.env.PINTEREST_APP_SECRET ?? "",
  redirectUri: process.env.PINTEREST_REDIRECT_URI ?? "",
  apiBase: process.env.PINTEREST_API_BASE ?? "https://api.pinterest.com/v5",
  searchPageSize: Number(process.env.PINTEREST_SEARCH_PAGE_SIZE ?? 25),
  scopes: ["pins:read", "boards:read"] as const,
} as const;

export const isPinterestConfigured = (): boolean =>
  Boolean(
    pinterestConfig.appId &&
      pinterestConfig.appSecret &&
      pinterestConfig.redirectUri
  );

export function assertPinterestConfigured(): void {
  if (!isPinterestConfigured()) {
    throw new Error(
      "Pinterest OAuth is not configured. Set PINTEREST_APP_ID, PINTEREST_APP_SECRET, and PINTEREST_REDIRECT_URI."
    );
  }
}

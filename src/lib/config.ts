export const siteConfig = {
  name: "Pinterest Integration",
  domain: "localhost",
  url: "http://localhost:3000",
} as const;

export type SiteConfig = typeof siteConfig;

export const pinterestConfig = {
  appId: process.env.PINTEREST_APP_ID ?? "",
  appSecret: process.env.PINTEREST_APP_SECRET ?? "",
  redirectUri:
    process.env.PINTEREST_REDIRECT_URI ??
    "http://localhost:3000/api/pinterest/auth/callback",
  apiBase: process.env.PINTEREST_API_BASE ?? "https://api.pinterest.com/v5",
  searchPageSize: Number(process.env.PINTEREST_SEARCH_PAGE_SIZE ?? 25),
  scopes: ["pins:read", "boards:read"] as const,
} as const;

export const isPinterestConfigured = (): boolean =>
  Boolean(pinterestConfig.appId && pinterestConfig.appSecret);

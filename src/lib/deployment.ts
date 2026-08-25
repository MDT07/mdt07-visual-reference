export type AppMode = "public" | "studio";

export function parseAppMode(value: string | undefined): AppMode {
  return value?.trim().toLowerCase() === "studio" ? "studio" : "public";
}

function normalizeUrl(value: string): string {
  return value.replace(/\/$/, "");
}

const defaultPublicUrl =
  process.env.NODE_ENV === "production"
    ? "https://mdt07-visual-reference.vercel.app"
    : "http://localhost:3000";

const publicUrl = normalizeUrl(
  process.env.PUBLIC_SITE_URL ?? process.env.SITE_URL ?? defaultPublicUrl
);

const appUrl = normalizeUrl(
  process.env.APP_URL ?? process.env.SITE_URL ?? publicUrl
);

const appMode = parseAppMode(process.env.APP_MODE);

export const deploymentConfig = {
  appMode,
  appUrl,
  publicUrl,
  isPublic: appMode === "public",
  isStudio: appMode === "studio",
  ownerGithubId: process.env.OWNER_GITHUB_ID?.trim() ?? "",
} as const;

export function getAppUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${deploymentConfig.appUrl}${normalizedPath}`;
}

export function isOwnerAuthConfigured(): boolean {
  return Boolean(
    deploymentConfig.isStudio &&
      deploymentConfig.ownerGithubId &&
      /^\d+$/.test(deploymentConfig.ownerGithubId) &&
      (process.env.AUTH_SECRET?.trim().length ?? 0) >= 32 &&
      process.env.AUTH_GITHUB_ID?.trim() &&
      process.env.AUTH_GITHUB_SECRET?.trim()
  );
}

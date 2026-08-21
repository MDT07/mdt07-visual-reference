import type { PinterestTokenResponse } from "./types";

interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

let memoryStore: StoredTokens | null = null;

function loadFromEnv(): StoredTokens | null {
  const access = process.env.PINTEREST_ACCESS_TOKEN;
  if (!access) return null;
  return {
    accessToken: access,
    refreshToken: process.env.PINTEREST_REFRESH_TOKEN,
    expiresAt: process.env.PINTEREST_TOKEN_EXPIRES_AT
      ? Number(process.env.PINTEREST_TOKEN_EXPIRES_AT)
      : undefined,
  };
}

export function getTokens(): StoredTokens | null {
  if (memoryStore) return memoryStore;
  return loadFromEnv();
}

export function saveTokens(tokens: PinterestTokenResponse): StoredTokens {
  const expiresAt = Date.now() + tokens.expires_in * 1000;
  memoryStore = {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt,
  };
  return memoryStore;
}

export function updateAccessToken(
  accessToken: string,
  expiresIn: number,
  refreshToken?: string
): void {
  const current = getTokens();
  memoryStore = {
    accessToken,
    refreshToken: refreshToken ?? current?.refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };
}

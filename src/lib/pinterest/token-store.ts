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
  // В dev выводим в консоль, чтобы пользователь мог скопировать в .env.local.
  // В prod здесь должна быть запись в KV/DB.
  if (process.env.NODE_ENV === "development") {
    console.log("\n=== Pinterest tokens ===");
    console.log(`PINTEREST_ACCESS_TOKEN=${tokens.access_token}`);
    if (tokens.refresh_token) {
      console.log(`PINTEREST_REFRESH_TOKEN=${tokens.refresh_token}`);
    }
    console.log(`PINTEREST_TOKEN_EXPIRES_AT=${expiresAt}`);
    console.log("========================\n");
  }
  return memoryStore;
}

export function updateAccessToken(accessToken: string, expiresIn: number): void {
  const current = getTokens();
  memoryStore = {
    accessToken,
    refreshToken: current?.refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };
}

import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { pinterestConfig } from "@/lib/config";
import type { PinterestTokenResponse } from "./types";

export interface PinterestSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  refreshExpiresAt?: number;
}

const SESSION_COOKIE_PRODUCTION = "__Host-mdt07-vref-pinterest-session";
const SESSION_COOKIE_DEVELOPMENT = "mdt07-vref-pinterest-session";
const SESSION_MAX_AGE_SECONDS = 60 * 24 * 60 * 60;

export const oauthStateCookieName =
  process.env.NODE_ENV === "production"
    ? "__Host-mdt07-vref-pinterest-oauth-state"
    : "mdt07-vref-pinterest-oauth-state";

export const pinterestSessionCookieName =
  process.env.NODE_ENV === "production"
    ? SESSION_COOKIE_PRODUCTION
    : SESSION_COOKIE_DEVELOPMENT;

function encryptionKey(): Buffer {
  if (pinterestConfig.sessionSecret.length < 32) {
    throw new Error(
      "PINTEREST_SESSION_SECRET must contain at least 32 characters."
    );
  }
  return createHash("sha256")
    .update(pinterestConfig.sessionSecret, "utf8")
    .digest();
}

function isPinterestSession(value: unknown): value is PinterestSession {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PinterestSession>;
  return (
    typeof candidate.accessToken === "string" &&
    candidate.accessToken.length > 0 &&
    typeof candidate.expiresAt === "number" &&
    Number.isFinite(candidate.expiresAt) &&
    (candidate.refreshToken === undefined ||
      typeof candidate.refreshToken === "string") &&
    (candidate.refreshExpiresAt === undefined ||
      (typeof candidate.refreshExpiresAt === "number" &&
        Number.isFinite(candidate.refreshExpiresAt)))
  );
}

export function createPinterestSession(
  tokens: PinterestTokenResponse,
  previous?: PinterestSession
): PinterestSession {
  const now = Date.now();
  const refreshExpiresAt = tokens.refresh_token_expires_in
    ? now + tokens.refresh_token_expires_in * 1000
    : tokens.refresh_token_expires_at
      ? tokens.refresh_token_expires_at * 1000
      : previous?.refreshExpiresAt;

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? previous?.refreshToken,
    expiresAt: now + tokens.expires_in * 1000,
    refreshExpiresAt,
  };
}

export function encryptPinterestSession(session: PinterestSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

export function decryptPinterestSession(
  encoded: string | undefined
): PinterestSession | null {
  if (!encoded) return null;
  try {
    const payload = Buffer.from(encoded, "base64url");
    if (payload.length <= 28) return null;
    const iv = payload.subarray(0, 12);
    const authTag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
    const session: unknown = JSON.parse(decrypted);
    return isPinterestSession(session) ? session : null;
  } catch {
    return null;
  }
}

export function getPinterestSessionFromRequest(
  request: NextRequest
): PinterestSession | null {
  return decryptPinterestSession(
    request.cookies.get(pinterestSessionCookieName)?.value
  );
}

export async function getPinterestSessionFromCookies(): Promise<PinterestSession | null> {
  const cookieStore = await cookies();
  return decryptPinterestSession(
    cookieStore.get(pinterestSessionCookieName)?.value
  );
}

export function setPinterestSession(
  response: NextResponse,
  session: PinterestSession
): void {
  const remainingRefreshLifetime = session.refreshExpiresAt
    ? Math.floor((session.refreshExpiresAt - Date.now()) / 1000)
    : SESSION_MAX_AGE_SECONDS;
  const maxAge = Math.max(
    60,
    Math.min(SESSION_MAX_AGE_SECONDS, remainingRefreshLifetime)
  );

  response.cookies.set(
    pinterestSessionCookieName,
    encryptPinterestSession(session),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    }
  );
}

export function clearPinterestSession(response: NextResponse): void {
  response.cookies.delete(pinterestSessionCookieName);
}

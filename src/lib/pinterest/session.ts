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
import { deploymentConfig } from "@/lib/deployment";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PinterestTokenResponse } from "./types";

export interface PinterestSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  refreshExpiresAt?: number;
  scope?: string;
}

export interface OwnerPinterestConnection {
  connectionHash: string;
  session: PinterestSession;
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
    throw new Error("PINTEREST_SESSION_SECRET must contain at least 32 characters.");
  }
  return createHash("sha256").update(pinterestConfig.sessionSecret, "utf8").digest();
}

function ownerGithubId(): string {
  if (!deploymentConfig.ownerGithubId) {
    throw new Error("OWNER_GITHUB_ID is required for Pinterest sessions.");
  }
  return deploymentConfig.ownerGithubId;
}

function sessionIdHash(sessionId: string): string {
  return createHash("sha256").update(sessionId, "utf8").digest("hex");
}

function isPinterestSession(value: unknown): value is PinterestSession {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PinterestSession>;
  return (
    typeof candidate.accessToken === "string" &&
    candidate.accessToken.length > 0 &&
    typeof candidate.expiresAt === "number" &&
    Number.isFinite(candidate.expiresAt) &&
    (candidate.refreshToken === undefined || typeof candidate.refreshToken === "string") &&
    (candidate.refreshExpiresAt === undefined ||
      (typeof candidate.refreshExpiresAt === "number" && Number.isFinite(candidate.refreshExpiresAt))) &&
    (candidate.scope === undefined || typeof candidate.scope === "string")
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
    scope: tokens.scope ?? previous?.scope,
  };
}

export function encryptPinterestSession(session: PinterestSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function decryptPinterestSession(encoded: string | undefined): PinterestSession | null {
  if (!encoded) return null;
  try {
    const payload = Buffer.from(encoded, "base64url");
    if (payload.length <= 28) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), payload.subarray(0, 12));
    decipher.setAuthTag(payload.subarray(12, 28));
    const decrypted = Buffer.concat([
      decipher.update(payload.subarray(28)),
      decipher.final(),
    ]).toString("utf8");
    const session: unknown = JSON.parse(decrypted);
    return isPinterestSession(session) ? session : null;
  } catch {
    return null;
  }
}

async function loadPinterestSession(sessionId: string | undefined): Promise<PinterestSession | null> {
  if (!sessionId) return null;
  const supabase = getSupabaseAdmin();
  const hash = sessionIdHash(sessionId);
  const { data, error } = await supabase
    .from("mdt07_pinterest_connections")
    .select("encrypted_payload,refresh_expires_at")
    .eq("session_id_hash", hash)
    .eq("owner_github_id", ownerGithubId())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  if (data.refresh_expires_at && new Date(data.refresh_expires_at).getTime() <= Date.now()) {
    await supabase.from("mdt07_pinterest_connections").delete().eq("session_id_hash", hash);
    return null;
  }

  const session = decryptPinterestSession(data.encrypted_payload);
  if (!session) {
    await supabase.from("mdt07_pinterest_connections").delete().eq("session_id_hash", hash);
    return null;
  }

  void supabase
    .from("mdt07_pinterest_connections")
    .update({ last_used_at: new Date().toISOString() })
    .eq("session_id_hash", hash);
  return session;
}

export async function getPinterestSessionFromRequest(
  request: NextRequest
): Promise<PinterestSession | null> {
  return loadPinterestSession(request.cookies.get(pinterestSessionCookieName)?.value);
}

export async function getPinterestSessionFromCookies(): Promise<PinterestSession | null> {
  const cookieStore = await cookies();
  return loadPinterestSession(cookieStore.get(pinterestSessionCookieName)?.value);
}

export async function getLatestOwnerPinterestConnection(): Promise<OwnerPinterestConnection | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("mdt07_pinterest_connections")
    .select("session_id_hash,encrypted_payload,refresh_expires_at")
    .eq("owner_github_id", ownerGithubId())
    .order("last_used_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  if (data.refresh_expires_at && new Date(data.refresh_expires_at).getTime() <= Date.now()) {
    await supabase
      .from("mdt07_pinterest_connections")
      .delete()
      .eq("session_id_hash", data.session_id_hash)
      .eq("owner_github_id", ownerGithubId());
    return null;
  }

  const session = decryptPinterestSession(data.encrypted_payload);
  if (!session) return null;
  return { connectionHash: data.session_id_hash, session };
}

export async function updateOwnerPinterestConnection(
  connectionHash: string,
  session: PinterestSession
): Promise<void> {
  if (!/^[a-f0-9]{64}$/.test(connectionHash)) {
    throw new Error("Invalid Pinterest connection identifier.");
  }

  const now = new Date().toISOString();
  const { error } = await getSupabaseAdmin()
    .from("mdt07_pinterest_connections")
    .update({
      encrypted_payload: encryptPinterestSession(session),
      access_expires_at: new Date(session.expiresAt).toISOString(),
      refresh_expires_at: session.refreshExpiresAt
        ? new Date(session.refreshExpiresAt).toISOString()
        : null,
      updated_at: now,
      last_used_at: now,
    })
    .eq("session_id_hash", connectionHash)
    .eq("owner_github_id", ownerGithubId());
  if (error) throw error;
}

export async function setPinterestSession(
  response: NextResponse,
  session: PinterestSession,
  request?: NextRequest
): Promise<void> {
  const existingSessionId = request?.cookies.get(pinterestSessionCookieName)?.value;
  const sessionId = existingSessionId ?? randomBytes(32).toString("base64url");
  const now = new Date().toISOString();
  const { error } = await getSupabaseAdmin().from("mdt07_pinterest_connections").upsert({
    session_id_hash: sessionIdHash(sessionId),
    owner_github_id: ownerGithubId(),
    encrypted_payload: encryptPinterestSession(session),
    access_expires_at: new Date(session.expiresAt).toISOString(),
    refresh_expires_at: session.refreshExpiresAt
      ? new Date(session.refreshExpiresAt).toISOString()
      : null,
    updated_at: now,
    last_used_at: now,
  });
  if (error) throw error;

  const remainingRefreshLifetime = session.refreshExpiresAt
    ? Math.floor((session.refreshExpiresAt - Date.now()) / 1000)
    : SESSION_MAX_AGE_SECONDS;
  const maxAge = Math.max(60, Math.min(SESSION_MAX_AGE_SECONDS, remainingRefreshLifetime));
  response.cookies.set(pinterestSessionCookieName, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  });
}

export async function clearPinterestSession(
  response: NextResponse,
  request?: NextRequest
): Promise<void> {
  const sessionId = request?.cookies.get(pinterestSessionCookieName)?.value;
  if (sessionId) {
    const { error } = await getSupabaseAdmin()
      .from("mdt07_pinterest_connections")
      .delete()
      .eq("session_id_hash", sessionIdHash(sessionId))
      .eq("owner_github_id", ownerGithubId());
    if (error) throw error;
  }
  response.cookies.set(pinterestSessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });
}

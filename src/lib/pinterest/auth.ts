import { assertPinterestConfigured, pinterestConfig } from "@/lib/config";
import type { PinterestTokenResponse } from "./types";

export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function buildAuthorizationUrl(state: string): string {
  assertPinterestConfigured();
  const params = new URLSearchParams({
    client_id: pinterestConfig.appId,
    redirect_uri: pinterestConfig.redirectUri,
    response_type: "code",
    scope: pinterestConfig.scopes.join(" "),
    state,
  });
  return `https://www.pinterest.com/oauth/?${params.toString()}`;
}

function basicAuthHeader(): string {
  assertPinterestConfigured();
  const credentials = Buffer.from(
    `${pinterestConfig.appId}:${pinterestConfig.appSecret}`
  ).toString("base64");
  return `Basic ${credentials}`;
}

export async function exchangeCode(code: string): Promise<PinterestTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: pinterestConfig.redirectUri,
  });

  const res = await fetch(`${pinterestConfig.apiBase}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      message?: string;
      detail?: string;
    };
    throw new Error(
      `Pinterest token exchange failed: ${res.status} ${err.message ?? err.detail ?? JSON.stringify(err)}`
    );
  }

  return res.json();
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<PinterestTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(`${pinterestConfig.apiBase}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as {
      message?: string;
      detail?: string;
    };
    throw new Error(
      `Pinterest refresh failed: ${res.status} ${err.message ?? err.detail ?? JSON.stringify(err)}`
    );
  }

  return res.json();
}

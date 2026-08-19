import { pinterestConfig } from "@/lib/config";
import { refreshAccessToken } from "./auth";
import { getTokens, updateAccessToken } from "./token-store";
import type {
  PinterestPin,
  PinterestSearchResponse,
} from "./types";

export class PinterestError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "PinterestError";
  }
}

async function ensureAccessToken(): Promise<string> {
  const tokens = getTokens();
  if (!tokens) {
    throw new PinterestError(
      "Pinterest tokens not configured. Complete OAuth first.",
      401
    );
  }

  const isExpiringSoon =
    !tokens.expiresAt || tokens.expiresAt - Date.now() < 60 * 60 * 1000;

  if (isExpiringSoon && tokens.refreshToken) {
    const refreshed = await refreshAccessToken(tokens.refreshToken);
    updateAccessToken(refreshed.access_token, refreshed.expires_in);
    return refreshed.access_token;
  }

  return tokens.accessToken;
}

async function pinterestFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await ensureAccessToken();
  const url = `${pinterestConfig.apiBase}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as unknown;
    throw new PinterestError(
      `Pinterest API error: ${res.status}`,
      res.status,
      body
    );
  }

  return res.json();
}

export async function searchPins(
  query: string,
  options: { pageSize?: number; bookmark?: string } = {}
): Promise<PinterestSearchResponse> {
  const params = new URLSearchParams({
    q: query,
    page_size: String(options.pageSize ?? pinterestConfig.searchPageSize),
  });
  if (options.bookmark) {
    params.set("bookmark", options.bookmark);
  }

  return pinterestFetch<PinterestSearchResponse>(`/search/pins?${params.toString()}`);
}

export async function listBoards(): Promise<{
  items: unknown[];
  bookmark?: string | null;
}> {
  return pinterestFetch("/boards");
}

export async function getPin(pinId: string): Promise<PinterestPin> {
  return pinterestFetch(`/pins/${pinId}`);
}

export function getPinUrl(pinId: string): string {
  return `https://www.pinterest.com/pin/${pinId}/`;
}

export function getBestImageUrl(pin: PinterestPin): string | undefined {
  const images = pin.media?.images;
  if (!images) return undefined;
  return (
    images["1200x"]?.url ??
    images["600x"]?.url ??
    images["400x300"]?.url ??
    images["150x150"]?.url
  );
}

export function getAuthorUsername(pin: PinterestPin): string | undefined {
  return pin.board_owner?.username;
}

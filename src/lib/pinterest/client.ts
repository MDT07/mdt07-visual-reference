import "server-only";

import { pinterestConfig } from "@/lib/config";
import { refreshAccessToken } from "./auth";
import {
  createPinterestSession,
  type PinterestSession,
} from "./session";
import type {
  PinterestBoard,
  PinterestBoardsResponse,
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

export async function ensurePinterestSession(
  session: PinterestSession
): Promise<{ session: PinterestSession; refreshed: boolean }> {
  const isExpiringSoon =
    session.expiresAt - Date.now() < 60 * 60 * 1000;

  if (isExpiringSoon && session.refreshToken) {
    const refreshed = await refreshAccessToken(session.refreshToken);
    return {
      session: createPinterestSession(refreshed, session),
      refreshed: true,
    };
  }

  if (session.expiresAt <= Date.now()) {
    throw new PinterestError("Pinterest authorization has expired.", 401);
  }

  return { session, refreshed: false };
}

async function pinterestFetch<T>(
  session: PinterestSession,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${pinterestConfig.apiBase}${path}`;
  const res = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as unknown;
    console.error("Pinterest API error", {
      status: res.status,
      endpoint: new URL(res.url).pathname,
      scope: session.scope,
    });
    throw new PinterestError(
      `Pinterest API error: ${res.status}`,
      res.status,
      body
    );
  }

  return res.json();
}

export async function listPins(
  session: PinterestSession,
  options: { pageSize?: number; bookmark?: string } = {}
): Promise<{
  data: PinterestSearchResponse;
  session: PinterestSession;
  refreshed: boolean;
}> {
  const active = await ensurePinterestSession(session);
  const params = new URLSearchParams({
    page_size: String(options.pageSize ?? pinterestConfig.searchPageSize),
  });
  if (options.bookmark) {
    params.set("bookmark", options.bookmark);
  }

  const data = await pinterestFetch<PinterestSearchResponse>(
    active.session,
    `/pins?${params.toString()}`
  );
  return { data, session: active.session, refreshed: active.refreshed };
}

export async function listPinsAllPages(
  session: PinterestSession,
  options: { pageSize?: number; maxPages?: number } = {}
): Promise<{
  pins: PinterestPin[];
  session: PinterestSession;
  refreshed: boolean;
}> {
  const pageSize = options.pageSize ?? pinterestConfig.searchPageSize;
  const maxPages = options.maxPages ?? 2;
  const pins: PinterestPin[] = [];
  let bookmark: string | undefined;
  let activeSession = session;
  let refreshed = false;

  for (let page = 0; page < maxPages; page++) {
    const result = await listPins(activeSession, { pageSize, bookmark });
    pins.push(...result.data.items);
    activeSession = result.session;
    refreshed = refreshed || result.refreshed;
    bookmark = result.data.bookmark ?? undefined;
    if (!bookmark) break;
  }

  return { pins, session: activeSession, refreshed };
}

export async function listPublicBoards(
  session: PinterestSession,
  options: { pageSize?: number; bookmark?: string } = {}
): Promise<{
  data: PinterestBoardsResponse;
  session: PinterestSession;
  refreshed: boolean;
}> {
  const active = await ensurePinterestSession(session);
  const params = new URLSearchParams({
    page_size: String(options.pageSize ?? 50),
    privacy: "PUBLIC",
  });
  if (options.bookmark) params.set("bookmark", options.bookmark);

  const data = await pinterestFetch<PinterestBoardsResponse>(
    active.session,
    `/boards?${params.toString()}`
  );
  return { data, session: active.session, refreshed: active.refreshed };
}

export async function listPublicBoardsAllPages(
  session: PinterestSession,
  options: { pageSize?: number; maxPages?: number } = {}
): Promise<{
  boards: PinterestBoard[];
  session: PinterestSession;
  refreshed: boolean;
}> {
  const pageSize = options.pageSize ?? 50;
  const maxPages = options.maxPages ?? 2;
  const boards: PinterestBoard[] = [];
  let bookmark: string | undefined;
  let activeSession = session;
  let refreshed = false;

  for (let page = 0; page < maxPages; page++) {
    const result = await listPublicBoards(activeSession, { pageSize, bookmark });
    boards.push(...result.data.items);
    activeSession = result.session;
    refreshed = refreshed || result.refreshed;
    bookmark = result.data.bookmark ?? undefined;
    if (!bookmark) break;
  }

  return { boards, session: activeSession, refreshed };
}

export async function listPinsOnBoard(
  session: PinterestSession,
  boardId: string,
  options: { pageSize?: number; bookmark?: string } = {}
): Promise<{
  data: PinterestSearchResponse;
  session: PinterestSession;
  refreshed: boolean;
}> {
  const active = await ensurePinterestSession(session);
  const params = new URLSearchParams({
    page_size: String(options.pageSize ?? pinterestConfig.searchPageSize),
  });
  if (options.bookmark) params.set("bookmark", options.bookmark);

  const data = await pinterestFetch<PinterestSearchResponse>(
    active.session,
    `/boards/${encodeURIComponent(boardId)}/pins?${params.toString()}`
  );
  return { data, session: active.session, refreshed: active.refreshed };
}

export async function listPinsOnBoardAllPages(
  session: PinterestSession,
  boardId: string,
  options: { pageSize?: number; maxPages?: number } = {}
): Promise<{
  pins: PinterestPin[];
  session: PinterestSession;
  refreshed: boolean;
}> {
  const pageSize = options.pageSize ?? pinterestConfig.searchPageSize;
  const maxPages = options.maxPages ?? 1;
  const pins: PinterestPin[] = [];
  let bookmark: string | undefined;
  let activeSession = session;
  let refreshed = false;

  for (let page = 0; page < maxPages; page++) {
    const result = await listPinsOnBoard(activeSession, boardId, {
      pageSize,
      bookmark,
    });
    pins.push(...result.data.items);
    activeSession = result.session;
    refreshed = refreshed || result.refreshed;
    bookmark = result.data.bookmark ?? undefined;
    if (!bookmark) break;
  }

  return { pins, session: activeSession, refreshed };
}

export async function getPin(
  session: PinterestSession,
  pinId: string
): Promise<PinterestPin> {
  const active = await ensurePinterestSession(session);
  return pinterestFetch(active.session, `/pins/${pinId}`);
}

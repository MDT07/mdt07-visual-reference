import "server-only";

import { deploymentConfig } from "@/lib/deployment";
import {
  getBoard,
  listPinsOnBoardAllPages,
  listPublicBoardsAllPages,
} from "@/lib/pinterest/client";
import { getBestImage, getPinUrl } from "@/lib/pinterest/presentation";
import {
  getLatestOwnerPinterestConnection,
  updateOwnerPinterestConnection,
} from "@/lib/pinterest/session";
import type { PinterestBoard, PinterestPin } from "@/lib/pinterest/types";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

export interface PublicPin {
  id: string;
  sourceId: string;
  sourceUrl: string;
  title?: string;
  description?: string;
  altText?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  aspectRatio?: number;
  dominantColor?: string;
  authorUsername?: string;
  mediaType?: string;
}

export interface PublicBoard {
  id: string;
  name: string;
  description: string;
  pinCount: number;
  ownerUsername?: string;
  coverImageUrl?: string;
  thumbnailUrls: string[];
  pins: PublicPin[];
  updatedAt: string;
}

const publicCatalogApiUrl = process.env.PUBLIC_CATALOG_API_URL?.trim() ?? "";
const pinterestHosts = new Set(["pinterest.com", "www.pinterest.com", "pin.it"]);
const pinterestImageHosts = new Set(["i.pinimg.com"]);

function optionalText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

function safeHttpsUrl(value: unknown, allowedHosts?: Set<string>): string | undefined {
  if (typeof value !== "string") return undefined;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return undefined;
    if (allowedHosts && !allowedHosts.has(url.hostname)) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

function publicPinFromPinterest(pin: PinterestPin): PublicPin {
  const image = getBestImage(pin);
  const thumbnail = pin.media?.images?.["400x300"] ?? pin.media?.images?.["150x150"];

  return {
    id: `pinterest:${pin.id}`,
    sourceId: pin.id,
    sourceUrl: getPinUrl(pin.id),
    title: optionalText(pin.title, 240),
    description: optionalText(pin.description, 600),
    altText: optionalText(pin.alt_text, 500),
    imageUrl: safeHttpsUrl(image?.url, pinterestImageHosts),
    thumbnailUrl: safeHttpsUrl(thumbnail?.url, pinterestImageHosts),
    imageWidth: image?.width,
    imageHeight: image?.height,
    aspectRatio: image?.height ? image.width / image.height : undefined,
    dominantColor: optionalText(pin.dominant_color, 32),
    authorUsername: optionalText(pin.board_owner?.username, 120),
    mediaType: optionalText(pin.media?.media_type, 40),
  };
}

function publicBoardFromPinterest(board: PinterestBoard, pins: PublicPin[] = []): PublicBoard {
  const thumbnailUrls = (board.media?.pin_thumbnail_urls ?? [])
    .map((url) => safeHttpsUrl(url, pinterestImageHosts))
    .filter((url): url is string => Boolean(url))
    .slice(0, 4);

  return {
    id: board.id,
    name: optionalText(board.name, 240) ?? "Untitled Board",
    description: optionalText(board.description, 600) ?? "",
    pinCount: board.pin_count ?? pins.length,
    ownerUsername: optionalText(board.owner?.username, 120),
    coverImageUrl: safeHttpsUrl(board.media?.image_cover_url, pinterestImageHosts),
    thumbnailUrls,
    pins,
    updatedAt: board.board_pins_modified_at ?? board.created_at ?? "2026-01-01T00:00:00.000Z",
  };
}

function hasLocalCatalog(): boolean {
  return Boolean(
    deploymentConfig.isAdmin &&
      deploymentConfig.ownerGithubId &&
      isSupabaseConfigured()
  );
}

function remoteCatalogUrl(): URL | null {
  if (!publicCatalogApiUrl) return null;

  try {
    const url = new URL(publicCatalogApiUrl);
    if (url.protocol !== "https:" || url.pathname.replace(/\/$/, "") !== "/api/public/boards") {
      return null;
    }
    if (url.origin === deploymentConfig.appUrl) return null;
    return url;
  } catch {
    return null;
  }
}

function isRemotePublicPin(value: unknown): value is PublicPin {
  if (!value || typeof value !== "object") return false;
  const pin = value as Partial<PublicPin>;
  return Boolean(
    typeof pin.id === "string" &&
      typeof pin.sourceId === "string" &&
      safeHttpsUrl(pin.sourceUrl, pinterestHosts) &&
      (!pin.imageUrl || safeHttpsUrl(pin.imageUrl, pinterestImageHosts)) &&
      (!pin.thumbnailUrl || safeHttpsUrl(pin.thumbnailUrl, pinterestImageHosts))
  );
}

function isRemotePublicBoard(value: unknown): value is PublicBoard {
  if (!value || typeof value !== "object") return false;
  const board = value as Partial<PublicBoard>;
  return Boolean(
    typeof board.id === "string" &&
      /^\d+$/.test(board.id) &&
      typeof board.name === "string" &&
      typeof board.description === "string" &&
      typeof board.pinCount === "number" &&
      typeof board.updatedAt === "string" &&
      Array.isArray(board.thumbnailUrls) &&
      board.thumbnailUrls.every((url) => Boolean(safeHttpsUrl(url, pinterestImageHosts))) &&
      (!board.coverImageUrl || safeHttpsUrl(board.coverImageUrl, pinterestImageHosts)) &&
      Array.isArray(board.pins) &&
      board.pins.every(isRemotePublicPin)
  );
}

async function listLocalPinterestBoards(): Promise<PublicBoard[]> {
  const connection = await getLatestOwnerPinterestConnection();
  if (!connection) return [];

  const result = await listPublicBoardsAllPages(connection.session, {
    pageSize: 100,
    maxPages: 20,
  });
  if (result.refreshed) {
    await updateOwnerPinterestConnection(connection.connectionHash, result.session);
  }

  return result.boards
    .filter((board) => board.privacy === "PUBLIC")
    .map((board) => publicBoardFromPinterest(board))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

async function getLocalPinterestBoard(id: string): Promise<PublicBoard | null> {
  const connection = await getLatestOwnerPinterestConnection();
  if (!connection) return null;

  const boardResult = await getBoard(connection.session, id);
  if (boardResult.board.privacy !== "PUBLIC") return null;
  const pinsResult = await listPinsOnBoardAllPages(boardResult.session, id, {
    pageSize: 100,
    maxPages: 20,
  });
  if (boardResult.refreshed || pinsResult.refreshed) {
    await updateOwnerPinterestConnection(connection.connectionHash, pinsResult.session);
  }

  return publicBoardFromPinterest(
    boardResult.board,
    pinsResult.pins.map(publicPinFromPinterest)
  );
}

export function isPublicCatalogConfigured(): boolean {
  return hasLocalCatalog() || Boolean(remoteCatalogUrl());
}

export async function listPublicBoards(): Promise<PublicBoard[]> {
  if (!isPublicCatalogConfigured()) return [];

  try {
    if (hasLocalCatalog()) return await listLocalPinterestBoards();

    const apiUrl = remoteCatalogUrl();
    if (!apiUrl) return [];
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`catalog endpoint returned ${response.status}`);
    const payload: unknown = await response.json();
    if (!Array.isArray(payload) || !payload.every(isRemotePublicBoard)) {
      throw new Error("catalog endpoint returned an invalid payload");
    }
    return payload;
  } catch (error) {
    console.error("Public Board catalog could not be loaded", {
      message: error instanceof Error ? error.message : "unknown error",
    });
    return [];
  }
}

export async function getPublicBoard(id: string): Promise<PublicBoard | null> {
  if (!/^\d+$/.test(id) || !isPublicCatalogConfigured()) return null;

  try {
    if (hasLocalCatalog()) return await getLocalPinterestBoard(id);

    const apiUrl = remoteCatalogUrl();
    if (!apiUrl) return null;
    apiUrl.pathname = `${apiUrl.pathname.replace(/\/$/, "")}/${id}`;
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Board endpoint returned ${response.status}`);
    const payload: unknown = await response.json();
    return isRemotePublicBoard(payload) ? payload : null;
  } catch (error) {
    console.error("Public Board could not be loaded", {
      boardId: id,
      message: error instanceof Error ? error.message : "unknown error",
    });
    return null;
  }
}

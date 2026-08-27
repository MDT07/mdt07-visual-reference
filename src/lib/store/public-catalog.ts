import "server-only";

import { deploymentConfig } from "@/lib/deployment";
import type { VisualReference } from "@/lib/pinterest/types";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { listProjects } from "@/lib/store/projects";

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
  projectId: string;
  projectName: string;
  projectBrief: string;
  pinCount: number;
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

function publicPinFromReference(reference: VisualReference): PublicPin | null {
  const sourceUrl = safeHttpsUrl(reference.sourceUrl, pinterestHosts);
  if (!sourceUrl || reference.source !== "pinterest") return null;

  return {
    id: optionalText(reference.id, 160) ?? reference.sourceId,
    sourceId: optionalText(reference.sourceId, 160) ?? "",
    sourceUrl,
    title: optionalText(reference.title, 240),
    description: optionalText(reference.description, 600),
    altText: optionalText(reference.altText, 500),
    imageUrl: safeHttpsUrl(reference.imageUrl, pinterestImageHosts),
    thumbnailUrl: safeHttpsUrl(reference.thumbnailUrl, pinterestImageHosts),
    imageWidth: typeof reference.imageWidth === "number" ? reference.imageWidth : undefined,
    imageHeight: typeof reference.imageHeight === "number" ? reference.imageHeight : undefined,
    aspectRatio: typeof reference.aspectRatio === "number" ? reference.aspectRatio : undefined,
    dominantColor: optionalText(reference.dominantColor, 32),
    authorUsername: optionalText(reference.authorUsername, 120),
    mediaType: optionalText(reference.creativeType, 40),
  };
}

function hasLocalCatalog(): boolean {
  return Boolean(deploymentConfig.ownerGithubId && isSupabaseConfigured());
}

function remoteCatalogUrl(): string | null {
  if (!publicCatalogApiUrl) return null;

  try {
    const url = new URL(publicCatalogApiUrl);
    return url.protocol === "https:" && url.pathname === "/api/public/boards"
      ? url.toString()
      : null;
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
      typeof board.name === "string" &&
      typeof board.description === "string" &&
      typeof board.projectId === "string" &&
      typeof board.projectName === "string" &&
      typeof board.projectBrief === "string" &&
      typeof board.pinCount === "number" &&
      typeof board.updatedAt === "string" &&
      Array.isArray(board.pins) &&
      board.pins.every(isRemotePublicPin)
  );
}

async function listLocalPublicBoards(): Promise<PublicBoard[]> {
  const projects = await listProjects();

  return projects
    .filter((project) => project.status === "active")
    .flatMap((project) =>
      project.collections.map((collection) => {
        const pins = collection.references
          .filter((reference) => reference.catalog.status !== "archived")
          .map(publicPinFromReference)
          .filter((pin): pin is PublicPin => pin !== null);

        return {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          projectId: project.id,
          projectName: project.name,
          projectBrief: project.brief,
          pinCount: pins.length,
          pins,
          updatedAt: collection.updatedAt,
        };
      })
    )
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function isPublicCatalogConfigured(): boolean {
  return hasLocalCatalog() || Boolean(remoteCatalogUrl());
}

export async function listPublicBoards(): Promise<PublicBoard[]> {
  if (!isPublicCatalogConfigured()) return [];

  try {
    if (hasLocalCatalog()) return await listLocalPublicBoards();

    const apiUrl = remoteCatalogUrl();
    if (!apiUrl) return [];
    const response = await fetch(apiUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(`catalog endpoint returned ${response.status}`);
    const payload: unknown = await response.json();
    if (!Array.isArray(payload) || !payload.every(isRemotePublicBoard)) {
      throw new Error("catalog endpoint returned an invalid payload");
    }
    return payload;
  } catch (error) {
    console.error("Public catalog could not be loaded", {
      message: error instanceof Error ? error.message : "unknown error",
    });
    return [];
  }
}

export async function getPublicBoard(id: string): Promise<PublicBoard | null> {
  const boards = await listPublicBoards();
  return boards.find((board) => board.id === id) ?? null;
}

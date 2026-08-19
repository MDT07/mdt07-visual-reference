import { promises as fs } from "fs";
import path from "path";
import type { CuratedPin, PinterestPin, PinterestUsage } from "./pinterest/types";
import { getBestImageUrl, getAuthorUsername, getPinUrl } from "./pinterest/client";

const FILE_PATH = path.join(process.cwd(), "data", "references.json");

interface ReferenceStore {
  pins: CuratedPin[];
}

async function readStore(): Promise<ReferenceStore> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(raw) as ReferenceStore;
  } catch {
    return { pins: [] };
  }
}

async function writeStore(store: ReferenceStore): Promise<void> {
  await fs.writeFile(FILE_PATH, JSON.stringify(store, null, 2) + "\n", "utf-8");
}

export async function getReferences(): Promise<CuratedPin[]> {
  const store = await readStore();
  return store.pins;
}

export async function saveReference(
  pin: PinterestPin,
  query: string,
  usage: PinterestUsage = "reference"
): Promise<CuratedPin> {
  const store = await readStore();
  const existing = store.pins.find((p) => p.pinterestId === pin.id);
  if (existing) return existing;

  const imageUrl = getBestImageUrl(pin);
  if (!imageUrl) {
    throw new Error("Pin has no usable image");
  }

  const image =
    pin.media.images?.["1200x"] ??
    pin.media.images?.["600x"] ??
    pin.media.images?.["400x300"] ??
    pin.media.images?.["150x150"];

  const curated: CuratedPin = {
    id: `pin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    pinterestId: pin.id,
    title: pin.title,
    description: pin.description,
    altText: pin.alt_text,
    link: pin.link,
    sourceUrl: getPinUrl(pin.id),
    imageUrl,
    imageWidth: image?.width,
    imageHeight: image?.height,
    dominantColor: pin.dominant_color,
    authorUsername: getAuthorUsername(pin),
    mediaType: pin.media.media_type,
    usage,
    query,
    savedAt: new Date().toISOString(),
  };

  store.pins.unshift(curated);
  await writeStore(store);
  return curated;
}

export async function removeReference(id: string): Promise<void> {
  const store = await readStore();
  store.pins = store.pins.filter((p) => p.id !== id);
  await writeStore(store);
}

import "server-only";

import type { PinterestPin } from "@/lib/pinterest/types";

interface CacheEntry {
  pins: PinterestPin[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 5 * 60 * 1000;

function buildCacheKey(query: string): string {
  return query.toLowerCase().trim();
}

export function getCachedPins(query: string): PinterestPin[] | undefined {
  const key = buildCacheKey(query);
  const entry = cache.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }

  return entry.pins;
}

export function setCachedPins(
  query: string,
  pins: PinterestPin[],
  ttlMs = DEFAULT_TTL_MS
): void {
  cache.set(buildCacheKey(query), { pins, expiresAt: Date.now() + ttlMs });
}

export function clearSearchCache(): void {
  cache.clear();
}

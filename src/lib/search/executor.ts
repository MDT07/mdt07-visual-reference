import "server-only";

import { searchPinsAllPages } from "@/lib/pinterest/client";
import type { PinterestSession } from "@/lib/pinterest/session";
import type { PinterestPin } from "@/lib/pinterest/types";
import type { SearchStrategy } from "./types";

export async function executeSearchStrategies(
  session: PinterestSession,
  strategies: SearchStrategy[],
  options: { pageSize?: number; maxPagesPerQuery?: number } = {}
): Promise<{
  results: { strategy: SearchStrategy; pins: PinterestPin[] }[];
  session: PinterestSession;
  refreshed: boolean;
}> {
  let activeSession = session;
  let refreshed = false;
  const results: { strategy: SearchStrategy; pins: PinterestPin[] }[] = [];

  for (const strategy of strategies) {
    const res = await searchPinsAllPages(activeSession, strategy.query, {
      pageSize: options.pageSize,
      maxPages: options.maxPagesPerQuery,
    });
    activeSession = res.session;
    refreshed = refreshed || res.refreshed;
    results.push({ strategy, pins: res.pins });
  }

  return { results, session: activeSession, refreshed };
}

import "server-only";

import { listPinsAllPages } from "@/lib/pinterest/client";
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
  const primaryStrategy = strategies[0];
  if (!primaryStrategy) {
    return { results: [], session, refreshed: false };
  }

  const res = await listPinsAllPages(session, {
    pageSize: options.pageSize,
    maxPages: options.maxPagesPerQuery,
  });

  return {
    results: [{ strategy: primaryStrategy, pins: res.pins }],
    session: res.session,
    refreshed: res.refreshed,
  };
}

import "server-only";

import type { PinterestSession } from "@/lib/pinterest/session";
import type { VisualReference } from "@/lib/pinterest/types";
import { toVisualReference } from "@/lib/pinterest/mapper";
import { deduplicateReferences } from "./dedup";
import { executeSearchStrategies } from "./executor";
import { parseDesignBrief } from "./parser";
import { generateSearchStrategies } from "./query-generator";
import { scoreAndRank } from "./scorer";
import type { SearchPipelineInput, SearchPipelineResult } from "./types";

export async function runSearchPipeline(
  session: PinterestSession,
  input: SearchPipelineInput
): Promise<SearchPipelineResult> {
  const brief = parseDesignBrief(input.prompt);
  const mode = input.mode ?? "inspiration";
  const limit = input.limit ?? brief.quantity;
  const maxQueries = input.maxQueries ?? 6;
  const maxPagesPerQuery = input.maxPagesPerQuery ?? 2;

  const strategies = generateSearchStrategies(brief, mode).slice(0, maxQueries);
  const execution = await executeSearchStrategies(session, strategies, {
    maxPagesPerQuery,
  });

  const flatPins = execution.results.flatMap((result) =>
    result.pins.map((pin) => ({
      pin,
      query: result.strategy.query,
    }))
  );

  let references = flatPins
    .map((item) => toVisualReference(item.pin, item.query))
    .filter((ref): ref is VisualReference => ref !== null);

  const candidates = references.length;
  references = deduplicateReferences(references);
  const duplicatesRemoved = candidates - references.length;
  references = scoreAndRank(references, brief, mode);
  references = references.slice(0, limit);

  return {
    brief,
    strategies,
    candidates,
    duplicatesRemoved,
    results: references,
  };
}

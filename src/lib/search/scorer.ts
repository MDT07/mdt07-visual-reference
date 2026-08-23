import type { VisualReference } from "@/lib/pinterest/types";
import type { DesignBrief, SearchMode } from "./types";

function tokenOverlap(
  reference: VisualReference,
  brief: DesignBrief
): number {
  const refText = [
    reference.title,
    reference.description,
    reference.altText,
    ...(reference.designAttributes?.layout ?? []),
    ...(reference.designAttributes?.typography ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const briefTokens = [
    ...brief.style,
    ...brief.mood,
    ...brief.colors,
    ...brief.typography,
    ...brief.layout,
    brief.industry,
    brief.websiteType,
  ].filter((token): token is string => Boolean(token));

  if (briefTokens.length === 0) return 0;
  const matches = briefTokens.filter((token) => refText.includes(token)).length;
  return matches / briefTokens.length;
}

function calculateQualityScore(reference: VisualReference): number {
  let score = 0;

  if (reference.imageWidth && reference.imageWidth >= 1200) score += 0.3;
  else if (reference.imageWidth && reference.imageWidth >= 600) score += 0.15;

  if (reference.title && reference.description) score += 0.2;
  else if (reference.title) score += 0.1;

  if (reference.dominantColor) score += 0.1;
  if (reference.authorUsername) score += 0.1;

  if (
    reference.aspectRatio &&
    reference.aspectRatio >= 1.2 &&
    reference.aspectRatio <= 2.5
  ) {
    score += 0.2;
  }

  return Math.min(1, score);
}

export function scoreAndRank(
  references: VisualReference[],
  brief: DesignBrief,
  mode: SearchMode = "inspiration"
): VisualReference[] {
  const weights =
    mode === "premium"
      ? { relevance: 0.3, quality: 0.35, style: 0.2, uniqueness: 0.15 }
      : mode === "precision"
      ? { relevance: 0.5, quality: 0.2, style: 0.2, uniqueness: 0.1 }
      : { relevance: 0.35, quality: 0.25, style: 0.25, uniqueness: 0.15 };

  const scored = references.map((reference) => {
    const relevance = tokenOverlap(reference, brief);
    const quality = calculateQualityScore(reference);
    const uniqueness = 0.5;

    const finalScore =
      weights.relevance * relevance +
      weights.quality * quality +
      weights.style * relevance +
      weights.uniqueness * uniqueness;

    return {
      ...reference,
      relevanceScore: Math.round(relevance * 1000) / 1000,
      qualityScore: Math.round(quality * 1000) / 1000,
      finalScore: Math.round(finalScore * 1000) / 1000,
    };
  });

  return scored.sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
}

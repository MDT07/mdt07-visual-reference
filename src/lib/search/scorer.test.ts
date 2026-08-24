import { describe, expect, it } from "vitest";
import { scoreAndRank } from "./scorer";
import type { VisualReference } from "@/lib/pinterest/types";
import type { DesignBrief } from "./types";

function makeRef(overrides: Partial<VisualReference> = {}): VisualReference {
  return {
    id: "pinterest:test",
    source: "pinterest",
    sourceId: "test",
    sourceUrl: "https://www.pinterest.com/pin/test/",
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

const baseBrief: DesignBrief = {
  raw: "luxury fashion website",
  projectType: "luxury fashion website",
  industry: "fashion",
  websiteType: "website",
  style: ["luxury", "editorial"],
  mood: ["premium"],
  colors: ["black", "gold"],
  typography: ["serif"],
  layout: ["asymmetric"],
  imagery: [],
  motion: [],
  quality: "premium",
  quantity: 20,
};

describe("scoreAndRank", () => {
  it("ranks references with higher relevance above others", () => {
    const refs = [
      makeRef({
        sourceId: "a",
        title: "luxury editorial fashion website",
        description: "black and gold serif layout",
      }),
      makeRef({
        sourceId: "b",
        title: "random photography",
        description: "nature landscape",
      }),
    ];

    const ranked = scoreAndRank(refs, baseBrief);
    expect(ranked[0].sourceId).toBe("a");
    expect(ranked[0].relevanceScore).toBeGreaterThan(
      ranked[1].relevanceScore ?? 0
    );
  });

  it("gives higher quality scores to larger images with metadata", () => {
    const refs = [
      makeRef({
        sourceId: "a",
        imageWidth: 1600,
        imageHeight: 900,
        title: "Great pin",
        description: "Description",
        dominantColor: "#000000",
        authorUsername: "designer",
      }),
      makeRef({ sourceId: "b", imageWidth: 400 }),
    ];

    const ranked = scoreAndRank(refs, baseBrief);
    const a = ranked.find((r) => r.sourceId === "a")!;
    const b = ranked.find((r) => r.sourceId === "b")!;
    expect(a.qualityScore).toBeGreaterThan(b.qualityScore ?? 0);
  });

  it("uses different weights for premium mode", () => {
    const refs = [
      makeRef({
        sourceId: "a",
        title: "luxury fashion website",
        description: "editorial layout",
        imageWidth: 1200,
        imageHeight: 800,
      }),
    ];

    const premium = scoreAndRank(refs, { ...baseBrief, quality: "premium" }, "premium");
    const precision = scoreAndRank(
      refs,
      { ...baseBrief, quality: "high" },
      "precision"
    );

    expect(premium[0].finalScore).not.toEqual(precision[0].finalScore);
  });

  it("does not mutate original references", () => {
    const refs = [makeRef({ sourceId: "a", title: "luxury fashion" })];
    const originalFinalScore = refs[0].finalScore;
    scoreAndRank(refs, baseBrief);
    expect(refs[0].finalScore).toBe(originalFinalScore);
  });
});

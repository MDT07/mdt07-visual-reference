import { describe, expect, it } from "vitest";
import { deduplicateReferences } from "./dedup";
import type { VisualReference } from "@/lib/pinterest/types";

function makeRef(overrides: Partial<VisualReference>): VisualReference {
  return {
    id: "test",
    source: "pinterest",
    sourceId: "pin-1",
    sourceUrl: "https://www.pinterest.com/pin/pin-1/",
    imageUrl: "https://example.com/image.jpg",
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("deduplicateReferences", () => {
  it("keeps unique references", () => {
    const items = [
      makeRef({ sourceId: "pin-1", imageUrl: "https://i/1.jpg" }),
      makeRef({ sourceId: "pin-2", imageUrl: "https://i/2.jpg" }),
    ];

    expect(deduplicateReferences(items)).toHaveLength(2);
  });

  it("removes duplicates by sourceId", () => {
    const items = [
      makeRef({ sourceId: "pin-1", imageUrl: "https://i/1.jpg" }),
      makeRef({ sourceId: "pin-1", imageUrl: "https://i/2.jpg" }),
      makeRef({ sourceId: "pin-2", imageUrl: "https://i/3.jpg" }),
    ];

    const result = deduplicateReferences(items);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.sourceId)).toEqual(["pin-1", "pin-2"]);
  });

  it("removes duplicates by imageUrl when sourceId is missing", () => {
    const items = [
      makeRef({ sourceId: "", imageUrl: "https://i/1.jpg" }),
      makeRef({ sourceId: "", imageUrl: "https://i/1.jpg" }),
      makeRef({ sourceId: "", imageUrl: "https://i/2.jpg" }),
    ];

    expect(deduplicateReferences(items)).toHaveLength(2);
  });

  it("drops items without sourceId or imageUrl", () => {
    const items = [
      makeRef({ sourceId: "", imageUrl: "" }),
      makeRef({ sourceId: "pin-1", imageUrl: "" }),
    ];

    expect(deduplicateReferences(items)).toHaveLength(1);
  });
});

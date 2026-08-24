import { describe, expect, it } from "vitest";
import { parseDesignBrief } from "./parser";

describe("parseDesignBrief", () => {
  it("extracts project type, industry, and style tokens", () => {
    const brief = parseDesignBrief(
      "Find references for a luxury fashion website with editorial minimal style"
    );

    expect(brief.raw).toBe(
      "Find references for a luxury fashion website with editorial minimal style"
    );
    expect(brief.projectType).toBe("luxury fashion website");
    expect(brief.industry).toBe("fashion");
    expect(brief.websiteType).toBe("website");
    expect(brief.style).toEqual(["minimal", "editorial", "luxury"]);
  });

  it("detects mood, color, typography, and layout tokens", () => {
    const brief = parseDesignBrief(
      "Dark cinematic portfolio with black and gold serif typography and asymmetric layout"
    );

    expect(brief.mood).toContain("cinematic");
    expect(brief.colors).toEqual(["black", "gold"]);
    expect(brief.typography).toContain("serif");
    expect(brief.layout).toContain("asymmetric");
  });

  it("marks premium quality when premium or awwwards is mentioned", () => {
    expect(parseDesignBrief("premium architecture website").quality).toBe(
      "premium"
    );
    expect(parseDesignBrief("awwwards style agency website").quality).toBe(
      "premium"
    );
  });

  it("defaults to high quality when no premium hint is present", () => {
    expect(parseDesignBrief("minimal SaaS landing page").quality).toBe("high");
  });

  it("returns empty arrays when no tokens match", () => {
    const brief = parseDesignBrief("something completely unrelated");

    expect(brief.style).toEqual([]);
    expect(brief.mood).toEqual([]);
    expect(brief.colors).toEqual([]);
    expect(brief.typography).toEqual([]);
    expect(brief.layout).toEqual([]);
  });
});

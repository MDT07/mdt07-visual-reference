import { describe, expect, it } from "vitest";

import { parseAppMode } from "./deployment";

describe("parseAppMode", () => {
  it("fails closed to public mode", () => {
    expect(parseAppMode(undefined)).toBe("public");
    expect(parseAppMode("")).toBe("public");
    expect(parseAppMode("unexpected")).toBe("public");
  });

  it("accepts explicit studio mode", () => {
    expect(parseAppMode("studio")).toBe("studio");
    expect(parseAppMode(" STUDIO ")).toBe("studio");
  });
});

import { describe, expect, it } from "vitest";

import { parseAppMode } from "./deployment";

describe("parseAppMode", () => {
  it("fails closed to public mode", () => {
    expect(parseAppMode(undefined)).toBe("public");
    expect(parseAppMode("")).toBe("public");
    expect(parseAppMode("unexpected")).toBe("public");
  });

  it("accepts explicit admin mode", () => {
    expect(parseAppMode("admin")).toBe("admin");
    expect(parseAppMode(" ADMIN ")).toBe("admin");
  });
});

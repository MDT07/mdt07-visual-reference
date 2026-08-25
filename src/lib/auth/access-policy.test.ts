import { describe, expect, it } from "vitest";

import { matchesOwnerAccess } from "./access-policy";

const owner = { githubId: "172265857", role: "OWNER" };

describe("matchesOwnerAccess", () => {
  it("allows only the configured owner in studio mode", () => {
    expect(
      matchesOwnerAccess(owner, {
        isStudio: true,
        ownerGithubId: "172265857",
      })
    ).toBe(true);
  });

  it("rejects owner identity in public mode", () => {
    expect(
      matchesOwnerAccess(owner, {
        isStudio: false,
        ownerGithubId: "172265857",
      })
    ).toBe(false);
  });

  it("rejects a different GitHub identity or role", () => {
    expect(
      matchesOwnerAccess(
        { githubId: "1", role: "OWNER" },
        { isStudio: true, ownerGithubId: "172265857" }
      )
    ).toBe(false);
    expect(
      matchesOwnerAccess(
        { githubId: "172265857", role: "UNAUTHORIZED" },
        { isStudio: true, ownerGithubId: "172265857" }
      )
    ).toBe(false);
  });

  it("fails closed when owner configuration is missing", () => {
    expect(
      matchesOwnerAccess(owner, { isStudio: true, ownerGithubId: "" })
    ).toBe(false);
  });
});

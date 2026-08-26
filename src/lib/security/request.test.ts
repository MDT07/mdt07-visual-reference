import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { deploymentConfig } from "@/lib/deployment";
import { hasValidMutationOrigin } from "./request";

function request(origin?: string, fetchSite?: string): NextRequest {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  if (fetchSite) headers.set("sec-fetch-site", fetchSite);
  return new NextRequest(`${deploymentConfig.appUrl}/api/test`, {
    method: "POST",
    headers,
  });
}

describe("hasValidMutationOrigin", () => {
  it("accepts the configured application origin", () => {
    expect(hasValidMutationOrigin(request(deploymentConfig.appUrl, "same-origin"))).toBe(
      true
    );
  });

  it("rejects missing, invalid, and cross-site origins", () => {
    expect(hasValidMutationOrigin(request())).toBe(false);
    expect(hasValidMutationOrigin(request("https://attacker.example"))).toBe(false);
    expect(
      hasValidMutationOrigin(request(deploymentConfig.appUrl, "cross-site"))
    ).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { isValidPinterestRedirectUri } from "./redirect-policy";

describe("isValidPinterestRedirectUri", () => {
  it("accepts the exact HTTPS callback on the application origin", () => {
    expect(
      isValidPinterestRedirectUri(
        "https://studio.example.com/api/pinterest/auth/callback",
        "https://studio.example.com"
      )
    ).toBe(true);
  });

  it("accepts the exact localhost callback for development", () => {
    expect(
      isValidPinterestRedirectUri(
        "http://localhost:3000/api/pinterest/auth/callback",
        "http://localhost:3000"
      )
    ).toBe(true);
  });

  it("rejects a callback on another deployment", () => {
    expect(
      isValidPinterestRedirectUri(
        "https://public.example.com/api/pinterest/auth/callback",
        "https://studio.example.com"
      )
    ).toBe(false);
  });

  it("rejects the wrong path, a trailing slash, or query parameters", () => {
    expect(
      isValidPinterestRedirectUri(
        "https://studio.example.com/api/pinterest/auth",
        "https://studio.example.com"
      )
    ).toBe(false);
    expect(
      isValidPinterestRedirectUri(
        "https://studio.example.com/api/pinterest/auth/callback/",
        "https://studio.example.com"
      )
    ).toBe(false);
    expect(
      isValidPinterestRedirectUri(
        "https://studio.example.com/api/pinterest/auth/callback?source=test",
        "https://studio.example.com"
      )
    ).toBe(false);
  });

  it("rejects insecure non-localhost callbacks and malformed URLs", () => {
    expect(
      isValidPinterestRedirectUri(
        "http://studio.example.com/api/pinterest/auth/callback",
        "http://studio.example.com"
      )
    ).toBe(false);
    expect(isValidPinterestRedirectUri("not-a-url", "https://studio.example.com")).toBe(
      false
    );
  });
});

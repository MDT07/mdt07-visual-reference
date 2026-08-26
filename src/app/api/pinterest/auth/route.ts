import { NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/auth/authorization";
import { buildAuthorizationUrl, generateState } from "@/lib/pinterest/auth";
import { isPinterestConfigured } from "@/lib/config";
import { oauthStateCookieName } from "@/lib/pinterest/session";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;

  if (!isPinterestConfigured()) {
    return NextResponse.json(
      { error: "Pinterest OAuth is not configured for this deployment." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const state = generateState();
  const url = buildAuthorizationUrl(state);
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.set(oauthStateCookieName, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}

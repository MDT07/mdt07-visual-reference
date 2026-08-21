import { NextResponse } from "next/server";
import { buildAuthorizationUrl, generateState } from "@/lib/pinterest/auth";
import { isPinterestConfigured } from "@/lib/config";
import { oauthStateCookieName } from "@/lib/pinterest/session";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  if (!isPinterestConfigured()) {
    return NextResponse.json(
      { error: "Pinterest OAuth is not configured for this deployment." },
      { status: 503 }
    );
  }

  const state = generateState();
  const url = buildAuthorizationUrl(state);
  const response = NextResponse.redirect(url);
  response.cookies.set(oauthStateCookieName, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}

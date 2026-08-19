import { NextResponse } from "next/server";
import { buildAuthorizationUrl, generateState } from "@/lib/pinterest/auth";

export async function GET(): Promise<NextResponse> {
  const state = generateState();
  const url = buildAuthorizationUrl(state);
  const response = NextResponse.redirect(url);
  response.cookies.set("pinterest_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}

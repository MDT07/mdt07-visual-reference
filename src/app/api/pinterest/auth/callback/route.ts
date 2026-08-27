import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/auth/authorization";
import { exchangeCode } from "@/lib/pinterest/auth";
import { getAppUrl } from "@/lib/deployment";
import {
  createPinterestSession,
  oauthStateCookieName,
  setPinterestSession,
} from "@/lib/pinterest/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(oauthStateCookieName)?.value;
  const error = searchParams.get("error");

  if (error) {
    const response = NextResponse.json(
      { error: `Pinterest error: ${error}` },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
    response.cookies.delete(oauthStateCookieName);
    return response;
  }

  if (!code || !state || state !== storedState) {
    const response = NextResponse.json(
      { error: "Invalid OAuth state" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
    response.cookies.delete(oauthStateCookieName);
    return response;
  }

  try {
    const tokens = await exchangeCode(code);
    const session = createPinterestSession(tokens);

    const redirectUrl = new URL(getAppUrl("/studio"));
    redirectUrl.searchParams.set("oauth", "success");
    const response = NextResponse.redirect(redirectUrl.toString());
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    await setPinterestSession(response, session, request);
    response.cookies.delete(oauthStateCookieName);
    return response;
  } catch (err) {
    console.error(
      "Pinterest OAuth callback failed:",
      err instanceof Error ? err.message : "Unknown error"
    );
    const response = NextResponse.json(
      { error: "Pinterest authorization could not be completed." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
    response.cookies.delete(oauthStateCookieName);
    return response;
  }
}

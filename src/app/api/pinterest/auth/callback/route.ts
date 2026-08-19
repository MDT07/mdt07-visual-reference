import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/pinterest/auth";
import { saveTokens } from "@/lib/pinterest/token-store";
import { siteConfig } from "@/lib/config";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get("pinterest_oauth_state")?.value;
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: `Pinterest error: ${error}` },
      { status: 400 }
    );
  }

  if (!code || !state || state !== storedState) {
    return NextResponse.json(
      { error: "Invalid OAuth state" },
      { status: 400 }
    );
  }

  try {
    const tokens = await exchangeCode(code);
    saveTokens(tokens);

    const redirectUrl = new URL("/", siteConfig.url);
    redirectUrl.searchParams.set("oauth", "success");
    const response = NextResponse.redirect(redirectUrl.toString());
    response.cookies.delete("pinterest_oauth_state");
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

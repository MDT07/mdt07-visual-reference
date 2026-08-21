import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/lib/config";
import { clearPinterestSession } from "@/lib/pinterest/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  if (origin && origin !== siteConfig.url) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const redirectUrl = new URL("/", siteConfig.url);
  redirectUrl.searchParams.set("oauth", "disconnected");
  const response = NextResponse.redirect(redirectUrl, 303);
  clearPinterestSession(response);
  return response;
}

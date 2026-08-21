import { NextRequest, NextResponse } from "next/server";
import { searchPins } from "@/lib/pinterest/client";
import { PinterestError } from "@/lib/pinterest/client";
import {
  clearPinterestSession,
  getPinterestSessionFromRequest,
  setPinterestSession,
} from "@/lib/pinterest/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const bookmark = searchParams.get("bookmark") ?? undefined;
  const session = getPinterestSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { error: "Connect Pinterest for this browser session before searching." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rateLimit = checkRateLimit(request, "pinterest-search", 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Search limit reached. Try again shortly." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  if (query.length > 200) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  if (bookmark && bookmark.length > 1_024) {
    return NextResponse.json({ error: "Invalid bookmark" }, { status: 400 });
  }

  try {
    const result = await searchPins(session, query.trim(), { bookmark });
    const response = NextResponse.json(result.data, {
      headers: {
        ...rateLimitHeaders(rateLimit),
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
      },
    });
    if (result.refreshed) setPinterestSession(response, result.session);
    return response;
  } catch (err) {
    const status = err instanceof PinterestError ? err.status : 500;
    console.error(
      "Pinterest search failed:",
      err instanceof Error ? err.message : "Unknown error"
    );
    const response = NextResponse.json(
      {
        error:
          status === 401
            ? "Pinterest authorization has expired. Connect again."
            : status === 429
              ? "Pinterest rate limit reached. Try again later."
              : "Pinterest search is temporarily unavailable.",
      },
      { status, headers: { "Cache-Control": "no-store" } }
    );
    if (status === 401) clearPinterestSession(response);
    return response;
  }
}

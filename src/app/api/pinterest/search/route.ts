import { NextRequest, NextResponse } from "next/server";
import { runSearchPipeline } from "@/lib/search/pipeline";
import { PinterestError } from "@/lib/pinterest/client";
import {
  clearPinterestSession,
  getPinterestSessionFromRequest,
} from "@/lib/pinterest/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { requireOwnerApi } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;

  const searchParams = request.nextUrl.searchParams;
  const prompt = searchParams.get("q");
  const boardId = searchParams.get("boardId");
  const mode = searchParams.get("mode") as
    | "inspiration"
    | "precision"
    | "premium"
    | "experimental"
    | null;
  const session = await getPinterestSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { error: "Connect Pinterest for this browser session before searching." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rateLimit = await checkRateLimit(request, "pinterest-search", 30, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Search limit reached. Try again shortly." },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rateLimit),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  if (!prompt || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing query" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!boardId || !/^\d+$/.test(boardId)) {
    return NextResponse.json(
      { error: "Select a public Pinterest board before searching." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (prompt.length > 500) {
    return NextResponse.json(
      { error: "Query too long" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const result = await runSearchPipeline(session, {
      prompt: prompt.trim(),
      boardId,
      mode: mode ?? "inspiration",
      limit: 30,
      maxQueries: 3,
      maxPagesPerQuery: 1,
    });

    return NextResponse.json(result, {
      headers: {
        ...rateLimitHeaders(rateLimit),
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
      },
    });
  } catch (err) {
    const status = err instanceof PinterestError ? err.status : 500;
    console.error(
      "Search pipeline failed:",
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
    if (status === 401) await clearPinterestSession(response, request);
    return response;
  }
}

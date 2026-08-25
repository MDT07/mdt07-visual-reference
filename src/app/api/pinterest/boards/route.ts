import { NextRequest, NextResponse } from "next/server";
import {
  listPublicBoardsAllPages,
  PinterestError,
} from "@/lib/pinterest/client";
import {
  clearPinterestSession,
  getPinterestSessionFromRequest,
  setPinterestSession,
} from "@/lib/pinterest/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { requireOwnerApi } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;

  const session = getPinterestSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: "Connect Pinterest for this browser session first." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rateLimit = checkRateLimit(request, "pinterest-boards", 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Board refresh limit reached. Try again shortly." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  try {
    const result = await listPublicBoardsAllPages(session, {
      pageSize: 50,
      maxPages: 2,
    });
    const response = NextResponse.json(
      {
        boards: result.boards.map((board) => ({
          id: board.id,
          name: board.name,
          description: board.description,
          pinCount: board.pin_count ?? 0,
          ownerUsername: board.owner?.username,
        })),
      },
      {
        headers: {
          ...rateLimitHeaders(rateLimit),
          "Cache-Control": "no-store, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
    if (result.refreshed) setPinterestSession(response, result.session);
    return response;
  } catch (error) {
    const status = error instanceof PinterestError ? error.status : 500;
    console.error(
      "Pinterest board listing failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    const response = NextResponse.json(
      {
        error:
          status === 401
            ? "Pinterest authorization has expired. Connect again."
            : status === 429
              ? "Pinterest rate limit reached. Try again later."
              : "Public Pinterest boards are temporarily unavailable.",
      },
      { status, headers: { "Cache-Control": "no-store" } }
    );
    if (status === 401) clearPinterestSession(response);
    return response;
  }
}

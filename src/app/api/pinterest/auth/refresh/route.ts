import { NextRequest, NextResponse } from "next/server";
import { ensurePinterestSession } from "@/lib/pinterest/client";
import {
  clearPinterestSession,
  getPinterestSessionFromRequest,
  setPinterestSession,
} from "@/lib/pinterest/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { requireOwnerApi } from "@/lib/auth/authorization";
import { hasValidMutationOrigin } from "@/lib/security/request";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;

  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const session = getPinterestSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: "Pinterest is not connected for this session." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const rateLimit = checkRateLimit(request, "pinterest-refresh", 10, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many refresh requests. Try again shortly." },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rateLimit),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    const active = await ensurePinterestSession({
      ...session,
      expiresAt: 0,
    });
    const response = NextResponse.json(
      { success: true },
      { headers: { ...rateLimitHeaders(rateLimit), "Cache-Control": "no-store" } }
    );
    setPinterestSession(response, active.session);
    return response;
  } catch (err) {
    console.error(
      "Pinterest token refresh failed:",
      err instanceof Error ? err.message : "Unknown error"
    );
    const response = NextResponse.json(
      { error: "Pinterest authorization has expired. Connect again." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
    clearPinterestSession(response);
    return response;
  }
}

import { NextRequest, NextResponse } from "next/server";

import { deploymentConfig } from "@/lib/deployment";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { getPublicBoard } from "@/lib/store/public-catalog";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  if (!deploymentConfig.isAdmin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const rateLimit = await checkRateLimit(request, "public-board-detail", 120, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Board refresh limit reached." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }
  const board = await getPublicBoard(id);
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  return NextResponse.json(board, {
    headers: {
      ...rateLimitHeaders(rateLimit),
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

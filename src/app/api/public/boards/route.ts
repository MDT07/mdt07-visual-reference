import { NextRequest, NextResponse } from "next/server";

import { deploymentConfig } from "@/lib/deployment";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { listPublicBoards } from "@/lib/store/public-catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!deploymentConfig.isAdmin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const rateLimit = await checkRateLimit(request, "public-board-catalog", 120, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Board catalog refresh limit reached." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }
  const boards = await listPublicBoards();

  return NextResponse.json(boards, {
    headers: {
      ...rateLimitHeaders(rateLimit),
      "Cache-Control": "no-store, max-age=0",
      Pragma: "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

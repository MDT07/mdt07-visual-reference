import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export async function enforceMutationRateLimit(
  request: NextRequest,
  namespace: string,
  limit = 120
): Promise<NextResponse | null> {
  const result = await checkRateLimit(request, namespace, limit, 60_000);
  if (result.allowed) return null;
  return NextResponse.json(
    { error: "Request limit reached. Try again shortly." },
    {
      status: 429,
      headers: {
        ...rateLimitHeaders(result),
        "Cache-Control": "no-store",
      },
    }
  );
}

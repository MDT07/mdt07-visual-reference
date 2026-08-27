import { NextRequest, NextResponse } from "next/server";

import { requireAgentApiAuth } from "@/lib/agent-auth";
import { runSearchPipeline } from "@/lib/search/pipeline";
import { getPinterestSessionFromRequest } from "@/lib/pinterest/session";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import type { SearchMode } from "@/lib/search/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authError = await requireAgentApiAuth(request);
  if (authError) return authError;

  const session = await getPinterestSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: "Pinterest is not connected for this session." },
      { status: 401 }
    );
  }

  const rateLimit = await checkRateLimit(request, "agent-search", 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit reached. Try again shortly." },
      {
        status: 429,
        headers: rateLimitHeaders(rateLimit),
      }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    prompt?: string;
    mode?: SearchMode;
    limit?: number;
  };

  if (!body.prompt || body.prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    );
  }

  const result = await runSearchPipeline(session, {
    prompt: body.prompt,
    mode: body.mode ?? "premium",
    limit: body.limit ?? 20,
    maxQueries: 3,
    maxPagesPerQuery: 1,
  });

  return NextResponse.json(result, {
    headers: {
      ...rateLimitHeaders(rateLimit),
      "Cache-Control": "no-store",
    },
  });
}

import "server-only";

import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

import { pinterestConfig } from "@/lib/config";
import { pinterestSessionCookieName } from "@/lib/pinterest/session";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
}

function requestKey(request: NextRequest, namespace: string): string {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";
  const ip = forwardedFor.split(",")[0]?.trim() ?? "unknown";
  const session = request.cookies.get(pinterestSessionCookieName)?.value ?? "anonymous";
  const secret = pinterestConfig.sessionSecret || "unconfigured";
  return createHash("sha256")
    .update(`${secret}:${namespace}:${ip}:${session}`)
    .digest("hex");
}

export async function checkRateLimit(
  request: NextRequest,
  namespace: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const fallback = { allowed: false, limit, remaining: 0, retryAfter: 60 };
  try {
    const { data, error } = await getSupabaseAdmin().rpc("mdt07_consume_rate_limit", {
      p_namespace: namespace,
      p_subject_hash: requestKey(request, namespace),
      p_limit: limit,
      p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
    });
    if (error) {
      console.error("Distributed rate limit failed", { namespace, code: error.code });
      return fallback;
    }
    const result = data?.[0];
    return result
      ? { allowed: result.allowed, limit, remaining: result.remaining, retryAfter: result.retry_after }
      : fallback;
  } catch (error) {
    console.error("Distributed rate limit unavailable", {
      namespace,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return fallback;
  }
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "Retry-After": String(result.retryAfter),
  };
}

import "server-only";

import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { pinterestConfig } from "@/lib/config";
import { pinterestSessionCookieName } from "@/lib/pinterest/session";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
}

const buckets = new Map<string, RateLimitBucket>();
let lastCleanup = 0;

function cleanupExpiredBuckets(now: number): void {
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function requestKey(request: NextRequest, namespace: string): string {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";
  const ip = forwardedFor.split(",")[0]?.trim() ?? "unknown";
  const session =
    request.cookies.get(pinterestSessionCookieName)?.value ?? "anonymous";
  const secret = pinterestConfig.sessionSecret || "local-rate-limit";

  return createHash("sha256")
    .update(`${secret}:${namespace}:${ip}:${session}`)
    .digest("hex");
}

export function checkRateLimit(
  request: NextRequest,
  namespace: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  cleanupExpiredBuckets(now);
  const key = requestKey(request, namespace);
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      retryAfter: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return {
    allowed: true,
    limit,
    remaining: limit - current.count,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function rateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "Retry-After": String(result.retryAfter),
  };
}

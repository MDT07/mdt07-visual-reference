import type { NextRequest } from "next/server";

import { deploymentConfig } from "@/lib/deployment";

export function hasValidMutationOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  if (request.headers.get("sec-fetch-site") === "cross-site") return false;

  try {
    return new URL(origin).origin === new URL(deploymentConfig.appUrl).origin;
  } catch {
    return false;
  }
}

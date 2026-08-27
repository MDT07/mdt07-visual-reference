import { NextRequest, NextResponse } from "next/server";

import { requireOwnerApi } from "@/lib/auth/authorization";
import { enforceMutationRateLimit } from "@/lib/security/mutation-rate-limit";
import { hasValidMutationOrigin } from "@/lib/security/request";
import { cleanupExpiredSecurityState } from "@/lib/store/security-state";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  const limitError = await enforceMutationRateLimit(request, "admin-maintenance", 10);
  if (limitError) return limitError;
  try {
    return NextResponse.json(await cleanupExpiredSecurityState(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Security state cleanup failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Maintenance could not be completed." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

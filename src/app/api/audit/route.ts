import { NextRequest, NextResponse } from "next/server";

import { requireOwnerApi } from "@/lib/auth/authorization";
import { listAuditEvents } from "@/lib/store/security-state";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 30);
  try {
    return NextResponse.json(
      { events: await listAuditEvents(Number.isFinite(limit) ? limit : 30) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Audit listing failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Audit events are temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/auth/authorization";
import { getAppUrl } from "@/lib/deployment";
import { clearPinterestSession } from "@/lib/pinterest/session";
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

  const redirectUrl = new URL(getAppUrl("/admin"));
  redirectUrl.searchParams.set("oauth", "disconnected");
  const response = NextResponse.redirect(redirectUrl, 303);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  await clearPinterestSession(response, request);
  return response;
}

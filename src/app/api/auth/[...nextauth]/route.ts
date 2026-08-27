import { NextRequest, NextResponse } from "next/server";

import { handlers } from "@/auth";
import { deploymentConfig, isOwnerAuthConfigured } from "@/lib/deployment";

function configurationError(): NextResponse | null {
  if (!deploymentConfig.isAdmin) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: { "Cache-Control": "no-store" } }
    );
  }
  if (!isOwnerAuthConfigured()) {
    return NextResponse.json(
      { error: "Owner authentication is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
  return null;
}

export async function GET(request: NextRequest): Promise<Response> {
  return configurationError() ?? handlers.GET(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return configurationError() ?? handlers.POST(request);
}

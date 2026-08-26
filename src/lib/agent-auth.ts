import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { agentApiConfig } from "@/lib/config";
import { requireOwnerApi } from "@/lib/auth/authorization";

const noStoreHeaders = { "Cache-Control": "no-store" } as const;

function keysMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export async function requireAgentApiAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  if (!agentApiConfig.enabled) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: noStoreHeaders }
    );
  }

  const ownerError = await requireOwnerApi();
  if (ownerError) return ownerError;

  if (!agentApiConfig.apiKey) {
    return NextResponse.json(
      { error: "Agent API is not configured." },
      { status: 503, headers: noStoreHeaders }
    );
  }

  const authorization = request.headers.get("authorization");
  const prefix = "Bearer ";
  if (!authorization?.startsWith(prefix)) {
    return NextResponse.json(
      { error: "Agent API authentication is required." },
      {
        status: 401,
        headers: {
          ...noStoreHeaders,
          "WWW-Authenticate": "Bearer",
        },
      }
    );
  }

  const provided = authorization.slice(prefix.length);
  if (!keysMatch(provided, agentApiConfig.apiKey)) {
    return NextResponse.json(
      { error: "Agent API authentication failed." },
      {
        status: 401,
        headers: {
          ...noStoreHeaders,
          "WWW-Authenticate": "Bearer",
        },
      }
    );
  }

  return null;
}

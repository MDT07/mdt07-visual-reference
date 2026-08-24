import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { agentApiConfig } from "@/lib/config";

function keysMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export function requireAgentApiAuth(
  request: NextRequest
): NextResponse | null {
  if (!agentApiConfig.enabled) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!agentApiConfig.apiKey) {
    return NextResponse.json(
      { error: "Agent API is not configured." },
      { status: 503 }
    );
  }

  const authorization = request.headers.get("authorization");
  const prefix = "Bearer ";
  if (!authorization?.startsWith(prefix)) {
    return NextResponse.json(
      { error: "Agent API authentication is required." },
      {
        status: 401,
        headers: { "WWW-Authenticate": "Bearer" },
      }
    );
  }

  const provided = authorization.slice(prefix.length);
  if (!keysMatch(provided, agentApiConfig.apiKey)) {
    return NextResponse.json(
      { error: "Agent API authentication failed." },
      {
        status: 401,
        headers: { "WWW-Authenticate": "Bearer" },
      }
    );
  }

  return null;
}

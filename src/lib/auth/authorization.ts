import "server-only";

import type { Session } from "next-auth";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { matchesOwnerAccess } from "@/lib/auth/access-policy";
import {
  deploymentConfig,
  isOwnerAuthConfigured,
} from "@/lib/deployment";

export function isOwnerSession(
  session: Session | null | undefined
): session is Session {
  return matchesOwnerAccess(session?.user, {
    isStudio: deploymentConfig.isStudio,
    ownerGithubId: deploymentConfig.ownerGithubId,
  });
}

export async function getOwnerSession(): Promise<Session | null> {
  if (!isOwnerAuthConfigured()) return null;
  const session = await auth();
  return isOwnerSession(session) ? session : null;
}

export async function requireOwnerApi(): Promise<NextResponse | null> {
  if (!deploymentConfig.isStudio) {
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

  const session = await auth();
  if (!isOwnerSession(session)) {
    return NextResponse.json(
      { error: "Owner authorization is required." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  return null;
}

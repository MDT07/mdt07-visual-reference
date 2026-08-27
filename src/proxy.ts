import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { matchesOwnerAccess } from "@/lib/auth/access-policy";
import { deploymentConfig, isOwnerAuthConfigured } from "@/lib/deployment";

type ProxyHandler = (
  request: NextRequest,
  event: NextFetchEvent
) => Response | Promise<Response>;

const authenticatedOwnerProxy = auth((request) => {
  if (
    !matchesOwnerAccess(request.auth?.user, {
      isAdmin: deploymentConfig.isAdmin,
      ownerGithubId: deploymentConfig.ownerGithubId,
    })
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}) as unknown as ProxyHandler;

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!deploymentConfig.isAdmin) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), {
      status: 404,
    });
  }

  if (!isOwnerAuthConfigured()) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return authenticatedOwnerProxy(request, event);
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/pinterest/auth";
import { getTokens, updateAccessToken } from "@/lib/pinterest/token-store";

export async function POST(): Promise<NextResponse> {
  const tokens = getTokens();
  if (!tokens?.refreshToken) {
    return NextResponse.json(
      { error: "Refresh token not available" },
      { status: 401 }
    );
  }

  try {
    const refreshed = await refreshAccessToken(tokens.refreshToken);
    updateAccessToken(refreshed.access_token, refreshed.expires_in);
    return NextResponse.json({
      success: true,
      expires_in: refreshed.expires_in,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

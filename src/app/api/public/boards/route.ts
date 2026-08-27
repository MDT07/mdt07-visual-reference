import { NextResponse } from "next/server";

import { listPublicBoards } from "@/lib/store/public-catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const boards = await listPublicBoards();

  return NextResponse.json(boards, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

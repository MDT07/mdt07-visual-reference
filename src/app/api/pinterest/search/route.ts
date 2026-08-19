import { NextRequest, NextResponse } from "next/server";
import { searchPins } from "@/lib/pinterest/client";
import { PinterestError } from "@/lib/pinterest/client";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const bookmark = searchParams.get("bookmark") ?? undefined;
  const pageSizeRaw = searchParams.get("page_size");
  const pageSize = pageSizeRaw ? Number(pageSizeRaw) : undefined;

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  if (query.length > 200) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  try {
    const data = await searchPins(query, { bookmark, pageSize });
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = err instanceof PinterestError ? err.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

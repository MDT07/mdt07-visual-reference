import { NextResponse } from "next/server";
import { listBoards } from "@/lib/pinterest/client";
import { PinterestError } from "@/lib/pinterest/client";

export async function GET(): Promise<NextResponse> {
  try {
    const data = await listBoards();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = err instanceof PinterestError ? err.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

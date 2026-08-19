import { NextRequest, NextResponse } from "next/server";
import { saveReference } from "@/lib/references";
import type { PinterestPin, PinterestUsage } from "@/lib/pinterest/types";

interface SaveReferenceBody {
  pin: PinterestPin;
  query: string;
  usage?: PinterestUsage;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SaveReferenceBody;

    if (!body.pin || !body.query) {
      return NextResponse.json(
        { error: "Missing pin or query" },
        { status: 400 }
      );
    }

    const curated = await saveReference(body.pin, body.query, body.usage);
    return NextResponse.json(curated, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

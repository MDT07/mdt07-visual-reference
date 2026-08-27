import { NextResponse } from "next/server";

import { requireOwnerApi } from "@/lib/auth/authorization";
import { listProjects } from "@/lib/store/projects";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  try {
    const body = {
      application: "MDT07 Visual Reference",
      exportedAt: new Date().toISOString(),
      projects: await listProjects(),
    };
    return new NextResponse(JSON.stringify(body, null, 2), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="mdt07-visual-reference-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error("Catalog export failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Catalog export is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

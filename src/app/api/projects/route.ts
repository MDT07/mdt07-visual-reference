import { NextRequest, NextResponse } from "next/server";

import { requireOwnerApi } from "@/lib/auth/authorization";
import { hasValidMutationOrigin } from "@/lib/security/request";
import { createProject, deleteProject, listProjects } from "@/lib/store/projects";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" } as const;

export async function GET(): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  try {
    return NextResponse.json({ projects: await listProjects() }, { headers: noStore });
  } catch (error) {
    console.error("Project listing failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Projects are temporarily unavailable." }, { status: 503, headers: noStore });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStore });
  }
  const body = (await request.json().catch(() => ({}))) as { name?: string; brief?: string };
  const name = body.name?.trim() ?? "";
  const brief = body.brief?.trim() ?? "";
  if (!name || name.length > 120 || brief.length > 2000) {
    return NextResponse.json({ error: "Use a project name up to 120 characters and a brief up to 2,000 characters." }, { status: 400, headers: noStore });
  }
  try {
    const project = await createProject(name, brief);
    return NextResponse.json({ project }, { status: 201, headers: noStore });
  } catch (error) {
    console.error("Project creation failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Project could not be created." }, { status: 503, headers: noStore });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStore });
  }
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "A valid project ID is required." }, { status: 400, headers: noStore });
  }
  try {
    const deleted = await deleteProject(id);
    return deleted
      ? NextResponse.json({ success: true }, { headers: noStore })
      : NextResponse.json({ error: "Project not found." }, { status: 404, headers: noStore });
  } catch (error) {
    console.error("Project deletion failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Project could not be deleted." }, { status: 503, headers: noStore });
  }
}

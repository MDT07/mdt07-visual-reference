import { NextRequest, NextResponse } from "next/server";

import { requireOwnerApi } from "@/lib/auth/authorization";
import { enforceMutationRateLimit } from "@/lib/security/mutation-rate-limit";
import { hasValidMutationOrigin } from "@/lib/security/request";
import { createProject, deleteProject, listProjects, updateProject } from "@/lib/store/projects";

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
  const limitError = await enforceMutationRateLimit(request, "catalog-project-write");
  if (limitError) return limitError;
  const body = (await request.json().catch(() => ({}))) as { name?: unknown; brief?: unknown };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const brief = typeof body.brief === "string" ? body.brief.trim() : "";
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

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStore });
  }
  const limitError = await enforceMutationRateLimit(request, "catalog-project-write");
  if (limitError) return limitError;
  const body = (await request.json().catch(() => ({}))) as {
    id?: unknown;
    name?: unknown;
    brief?: unknown;
    status?: unknown;
  };
  const validId = typeof body.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id);
  const validName = body.name === undefined || (typeof body.name === "string" && body.name.trim().length > 0 && body.name.trim().length <= 120);
  const validBrief = body.brief === undefined || (typeof body.brief === "string" && body.brief.trim().length <= 2000);
  const validStatus = body.status === undefined || body.status === "active" || body.status === "archived";
  const hasUpdate = body.name !== undefined || body.brief !== undefined || body.status !== undefined;
  if (!validId || !validName || !validBrief || !validStatus || !hasUpdate) {
    return NextResponse.json({ error: "A valid project update is required." }, { status: 400, headers: noStore });
  }
  try {
    const project = await updateProject(body.id as string, {
      name: body.name as string | undefined,
      brief: body.brief as string | undefined,
      status: body.status as "active" | "archived" | undefined,
    });
    return project
      ? NextResponse.json({ project }, { headers: noStore })
      : NextResponse.json({ error: "Project not found." }, { status: 404, headers: noStore });
  } catch (error) {
    console.error("Project update failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Project could not be updated." }, { status: 503, headers: noStore });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStore });
  }
  const limitError = await enforceMutationRateLimit(request, "catalog-project-write");
  if (limitError) return limitError;
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

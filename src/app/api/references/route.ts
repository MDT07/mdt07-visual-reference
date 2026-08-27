import { NextRequest, NextResponse } from "next/server";

import { requireOwnerApi } from "@/lib/auth/authorization";
import type { VisualReference } from "@/lib/pinterest/types";
import { hasValidMutationOrigin } from "@/lib/security/request";
import { addReferenceToProject, removeReferenceFromProject } from "@/lib/store/projects";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" } as const;

function isVisualReference(value: unknown): value is VisualReference {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<VisualReference>;
  return (
    item.source === "pinterest" &&
    typeof item.id === "string" &&
    typeof item.sourceId === "string" &&
    typeof item.sourceUrl === "string" &&
    item.sourceUrl.startsWith("https://www.pinterest.") &&
    typeof item.fetchedAt === "string"
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStore });
  }
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    collection?: string;
    reference?: unknown;
  };
  const collection = body.collection?.trim() ?? "";
  if (!body.projectId || !/^[0-9a-f-]{36}$/i.test(body.projectId) || !collection || collection.length > 120 || !isVisualReference(body.reference)) {
    return NextResponse.json({ error: "A valid project, collection, and Pinterest reference are required." }, { status: 400, headers: noStore });
  }
  try {
    const project = await addReferenceToProject(body.projectId, collection, body.reference);
    return project
      ? NextResponse.json({ project }, { headers: noStore })
      : NextResponse.json({ error: "Project not found." }, { status: 404, headers: noStore });
  } catch (error) {
    console.error("Reference save failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Reference could not be saved." }, { status: 503, headers: noStore });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStore });
  }
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    collection?: string;
    referenceId?: string;
  };
  if (!body.projectId || !body.collection || !body.referenceId) {
    return NextResponse.json({ error: "projectId, collection, and referenceId are required." }, { status: 400, headers: noStore });
  }
  try {
    const project = await removeReferenceFromProject(body.projectId, body.collection, body.referenceId);
    return project
      ? NextResponse.json({ project }, { headers: noStore })
      : NextResponse.json({ error: "Project not found." }, { status: 404, headers: noStore });
  } catch (error) {
    console.error("Reference removal failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Reference could not be removed." }, { status: 503, headers: noStore });
  }
}

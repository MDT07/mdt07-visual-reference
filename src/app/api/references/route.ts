import { NextRequest, NextResponse } from "next/server";

import { requireOwnerApi } from "@/lib/auth/authorization";
import type { VisualReference } from "@/lib/pinterest/types";
import { enforceMutationRateLimit } from "@/lib/security/mutation-rate-limit";
import { hasValidMutationOrigin } from "@/lib/security/request";
import {
  addReferenceToProject,
  removeReferenceFromProject,
  updateReferenceCatalog,
} from "@/lib/store/projects";

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
  const limitError = await enforceMutationRateLimit(request, "catalog-reference-write");
  if (limitError) return limitError;
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: unknown;
    collection?: unknown;
    reference?: unknown;
  };
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const collection = typeof body.collection === "string" ? body.collection.trim() : "";
  if (!/^[0-9a-f-]{36}$/i.test(projectId) || !collection || collection.length > 120 || !isVisualReference(body.reference)) {
    return NextResponse.json({ error: "A valid project, collection, and Pinterest reference are required." }, { status: 400, headers: noStore });
  }
  try {
    const project = await addReferenceToProject(projectId, collection, body.reference);
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
  const limitError = await enforceMutationRateLimit(request, "catalog-reference-write");
  if (limitError) return limitError;
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: unknown;
    collection?: unknown;
    referenceId?: unknown;
  };
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const collection = typeof body.collection === "string" ? body.collection.trim() : "";
  const referenceId = typeof body.referenceId === "string" ? body.referenceId : "";
  if (!/^[0-9a-f-]{36}$/i.test(projectId) || !collection || collection.length > 120 || !referenceId || referenceId.length > 160) {
    return NextResponse.json({ error: "projectId, collection, and referenceId are required." }, { status: 400, headers: noStore });
  }
  try {
    const project = await removeReferenceFromProject(projectId, collection, referenceId);
    return project
      ? NextResponse.json({ project }, { headers: noStore })
      : NextResponse.json({ error: "Project not found." }, { status: 404, headers: noStore });
  } catch (error) {
    console.error("Reference removal failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Reference could not be removed." }, { status: 503, headers: noStore });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStore });
  }
  const limitError = await enforceMutationRateLimit(request, "catalog-reference-write");
  if (limitError) return limitError;
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: unknown;
    collectionId?: unknown;
    referenceRecordId?: unknown;
    notes?: unknown;
    tags?: unknown;
    favorite?: unknown;
    status?: unknown;
  };
  const isUuid = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
  const statuses = ["saved", "shortlisted", "archived"];
  const normalizedTags = Array.isArray(body.tags)
    ? [...new Set(body.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean))].slice(0, 20)
    : undefined;
  const validTags = (body.tags === undefined || Array.isArray(body.tags)) && (normalizedTags === undefined || normalizedTags.every((tag) => tag.length <= 32));
  const validNotes = body.notes === undefined || (typeof body.notes === "string" && body.notes.length <= 4000);
  const validFavorite = body.favorite === undefined || typeof body.favorite === "boolean";
  const hasUpdate = body.notes !== undefined || body.tags !== undefined || body.favorite !== undefined || body.status !== undefined;
  if (!isUuid(body.projectId) || !isUuid(body.collectionId) || !isUuid(body.referenceRecordId) || !validNotes || !validTags || !validFavorite || (body.status !== undefined && (typeof body.status !== "string" || !statuses.includes(body.status))) || !hasUpdate) {
    return NextResponse.json({ error: "A valid reference catalog update is required." }, { status: 400, headers: noStore });
  }
  try {
    const project = await updateReferenceCatalog(
      body.projectId!,
      body.collectionId!,
      body.referenceRecordId!,
      {
        notes: body.notes as string | undefined,
        tags: normalizedTags,
        favorite: body.favorite as boolean | undefined,
        status: body.status as "saved" | "shortlisted" | "archived" | undefined,
      }
    );
    return project
      ? NextResponse.json({ project }, { headers: noStore })
      : NextResponse.json({ error: "Reference not found." }, { status: 404, headers: noStore });
  } catch (error) {
    console.error("Reference annotation failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Reference metadata could not be updated." }, { status: 503, headers: noStore });
  }
}

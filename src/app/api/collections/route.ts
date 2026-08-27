import { NextRequest, NextResponse } from "next/server";

import { requireOwnerApi } from "@/lib/auth/authorization";
import { enforceMutationRateLimit } from "@/lib/security/mutation-rate-limit";
import { hasValidMutationOrigin } from "@/lib/security/request";
import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "@/lib/store/projects";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" } as const;
const isUuid = (value: string | undefined): value is string =>
  Boolean(value && /^[0-9a-f-]{36}$/i.test(value));

export async function POST(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStore });
  }
  const limitError = await enforceMutationRateLimit(request, "catalog-collection-write");
  if (limitError) return limitError;
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: unknown;
    name?: unknown;
    description?: unknown;
  };
  const projectId = typeof body.projectId === "string" ? body.projectId : undefined;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!isUuid(projectId) || !name || name.length > 120 || description.length > 1000) {
    return NextResponse.json({ error: "A valid project, collection name, and description are required." }, { status: 400, headers: noStore });
  }
  try {
    const project = await createCollection(projectId, name, description);
    return project
      ? NextResponse.json({ project }, { status: 201, headers: noStore })
      : NextResponse.json({ error: "Project not found." }, { status: 404, headers: noStore });
  } catch (error) {
    console.error("Collection creation failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Collection could not be created. Its name may already exist." }, { status: 409, headers: noStore });
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStore });
  }
  const limitError = await enforceMutationRateLimit(request, "catalog-collection-write");
  if (limitError) return limitError;
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: unknown;
    collectionId?: unknown;
    name?: unknown;
    description?: unknown;
  };
  const projectId = typeof body.projectId === "string" ? body.projectId : undefined;
  const collectionId = typeof body.collectionId === "string" ? body.collectionId : undefined;
  const validName = body.name === undefined || (typeof body.name === "string" && body.name.trim().length > 0 && body.name.trim().length <= 120);
  const validDescription = body.description === undefined || (typeof body.description === "string" && body.description.trim().length <= 1000);
  if (!isUuid(projectId) || !isUuid(collectionId) || !validName || !validDescription || (body.name === undefined && body.description === undefined)) {
    return NextResponse.json({ error: "A valid collection update is required." }, { status: 400, headers: noStore });
  }
  try {
    const project = await updateCollection(projectId, collectionId, {
      name: body.name as string | undefined,
      description: body.description as string | undefined,
    });
    return project
      ? NextResponse.json({ project }, { headers: noStore })
      : NextResponse.json({ error: "Collection not found." }, { status: 404, headers: noStore });
  } catch (error) {
    console.error("Collection update failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Collection could not be updated." }, { status: 409, headers: noStore });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const accessError = await requireOwnerApi();
  if (accessError) return accessError;
  if (!hasValidMutationOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers: noStore });
  }
  const limitError = await enforceMutationRateLimit(request, "catalog-collection-write");
  if (limitError) return limitError;
  const body = (await request.json().catch(() => ({}))) as {
    projectId?: unknown;
    collectionId?: unknown;
  };
  const projectId = typeof body.projectId === "string" ? body.projectId : undefined;
  const collectionId = typeof body.collectionId === "string" ? body.collectionId : undefined;
  if (!isUuid(projectId) || !isUuid(collectionId)) {
    return NextResponse.json({ error: "A valid project and collection are required." }, { status: 400, headers: noStore });
  }
  try {
    const project = await deleteCollection(projectId, collectionId);
    return project
      ? NextResponse.json({ project }, { headers: noStore })
      : NextResponse.json({ error: "Collection not found." }, { status: 404, headers: noStore });
  } catch (error) {
    console.error("Collection deletion failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Collection could not be deleted." }, { status: 503, headers: noStore });
  }
}

import { NextRequest, NextResponse } from "next/server";

import { requireAgentApiAuth } from "@/lib/agent-auth";
import {
  addReferenceToProject,
  removeReferenceFromProject,
} from "@/lib/store/projects";
import type { VisualReference } from "@/lib/pinterest/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authError = await requireAgentApiAuth(request);
  if (authError) return authError;

  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    collection?: string;
    reference?: VisualReference;
  };

  if (!body.projectId || !body.collection || !body.reference) {
    return NextResponse.json(
      {
        error: "projectId, collection, and reference are required",
      },
      { status: 400 }
    );
  }

  const project = await addReferenceToProject(
    body.projectId,
    body.collection,
    body.reference
  );

  if (!project) {
    return NextResponse.json(
      { error: "Project not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ project });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const authError = await requireAgentApiAuth(request);
  if (authError) return authError;

  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    collection?: string;
    referenceId?: string;
  };

  if (!body.projectId || !body.collection || !body.referenceId) {
    return NextResponse.json(
      {
        error: "projectId, collection, and referenceId are required",
      },
      { status: 400 }
    );
  }

  const project = await removeReferenceFromProject(
    body.projectId,
    body.collection,
    body.referenceId
  );

  if (!project) {
    return NextResponse.json(
      { error: "Project not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ project });
}

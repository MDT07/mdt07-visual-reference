import { NextRequest, NextResponse } from "next/server";

import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
} from "@/lib/store/projects";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    brief?: string;
  };

  if (!body.name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    );
  }

  const project = await createProject(body.name, body.brief ?? "");
  return NextResponse.json({ project }, { status: 201 });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "id is required" },
      { status: 400 }
    );
  }

  const deleted = await deleteProject(id);
  if (!deleted) {
    return NextResponse.json(
      { error: "Project not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

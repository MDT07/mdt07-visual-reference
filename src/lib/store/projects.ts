import "server-only";

import { deploymentConfig } from "@/lib/deployment";
import type { VisualReference } from "@/lib/pinterest/types";
import type { Json } from "@/lib/supabase/database.types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface ReferenceCollection {
  id: string;
  name: string;
  references: VisualReference[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchProject {
  id: string;
  name: string;
  brief: string;
  collections: ReferenceCollection[];
  createdAt: string;
  updatedAt: string;
}

function ownerGithubId(): string {
  const ownerId = deploymentConfig.ownerGithubId;
  if (!ownerId) throw new Error("OWNER_GITHUB_ID is required for project storage.");
  return ownerId;
}

function referenceFromJson(value: Json): VisualReference {
  return value as unknown as VisualReference;
}

async function audit(
  action: string,
  targetType: string,
  targetId: string,
  metadata: Json = {}
): Promise<void> {
  const { error } = await getSupabaseAdmin().from("mdt07_audit_events").insert({
    owner_github_id: ownerGithubId(),
    action,
    target_type: targetType,
    target_id: targetId,
    metadata,
  });
  if (error) console.error("MDT07 audit write failed", { action, code: error.code });
}

export async function listProjects(): Promise<ResearchProject[]> {
  const ownerId = ownerGithubId();
  const supabase = getSupabaseAdmin();
  const { data: projects, error: projectsError } = await supabase
    .from("mdt07_projects")
    .select("id,name,brief,created_at,updated_at")
    .eq("owner_github_id", ownerId)
    .order("updated_at", { ascending: false });
  if (projectsError) throw projectsError;
  if (!projects?.length) return [];

  const projectIds = projects.map((project) => project.id);
  const [{ data: collections, error: collectionsError }, { data: references, error: referencesError }] =
    await Promise.all([
      supabase
        .from("mdt07_collections")
        .select("id,project_id,name,created_at,updated_at")
        .eq("owner_github_id", ownerId)
        .in("project_id", projectIds)
        .order("updated_at", { ascending: false }),
      supabase
        .from("mdt07_references")
        .select("project_id,collection_id,reference_data,saved_at")
        .eq("owner_github_id", ownerId)
        .in("project_id", projectIds)
        .order("saved_at", { ascending: false }),
    ]);
  if (collectionsError) throw collectionsError;
  if (referencesError) throw referencesError;

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    brief: project.brief,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    collections: (collections ?? [])
      .filter((collection) => collection.project_id === project.id)
      .map((collection) => ({
        id: collection.id,
        name: collection.name,
        createdAt: collection.created_at,
        updatedAt: collection.updated_at,
        references: (references ?? [])
          .filter((reference) => reference.collection_id === collection.id)
          .map((reference) => referenceFromJson(reference.reference_data)),
      })),
  }));
}

export async function getProject(id: string): Promise<ResearchProject | null> {
  const projects = await listProjects();
  return projects.find((project) => project.id === id) ?? null;
}

export async function createProject(name: string, brief: string): Promise<ResearchProject> {
  const ownerId = ownerGithubId();
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("mdt07_projects")
    .insert({ owner_github_id: ownerId, name: name.trim(), brief: brief.trim(), updated_at: now })
    .select("id,name,brief,created_at,updated_at")
    .single();
  if (error) throw error;
  await audit("project.created", "project", data.id);
  return {
    id: data.id,
    name: data.name,
    brief: data.brief,
    collections: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function deleteProject(id: string): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .from("mdt07_projects")
    .delete()
    .eq("id", id)
    .eq("owner_github_id", ownerGithubId())
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;
  await audit("project.deleted", "project", id);
  return true;
}

export async function addReferenceToProject(
  projectId: string,
  collectionName: string,
  reference: VisualReference
): Promise<ResearchProject | null> {
  const ownerId = ownerGithubId();
  const supabase = getSupabaseAdmin();
  const normalizedCollection = collectionName.trim();
  const { data: project, error: projectError } = await supabase
    .from("mdt07_projects")
    .select("id")
    .eq("id", projectId)
    .eq("owner_github_id", ownerId)
    .maybeSingle();
  if (projectError) throw projectError;
  if (!project) return null;

  const now = new Date().toISOString();
  const { data: collection, error: collectionError } = await supabase
    .from("mdt07_collections")
    .upsert(
      { project_id: projectId, owner_github_id: ownerId, name: normalizedCollection, updated_at: now },
      { onConflict: "project_id,name" }
    )
    .select("id")
    .single();
  if (collectionError) throw collectionError;

  const { error: referenceError } = await supabase.from("mdt07_references").upsert(
    {
      project_id: projectId,
      collection_id: collection.id,
      owner_github_id: ownerId,
      source: reference.source,
      source_id: reference.sourceId,
      source_url: reference.sourceUrl,
      reference_data: reference as unknown as Json,
      saved_at: now,
    },
    { onConflict: "collection_id,source,source_id", ignoreDuplicates: true }
  );
  if (referenceError) throw referenceError;

  const { error: touchError } = await supabase
    .from("mdt07_projects")
    .update({ updated_at: now })
    .eq("id", projectId)
    .eq("owner_github_id", ownerId);
  if (touchError) throw touchError;
  await audit("reference.saved", "reference", reference.sourceId, {
    projectId,
    collection: normalizedCollection,
    source: reference.source,
  });
  return getProject(projectId);
}

export async function removeReferenceFromProject(
  projectId: string,
  collectionName: string,
  referenceId: string
): Promise<ResearchProject | null> {
  const ownerId = ownerGithubId();
  const supabase = getSupabaseAdmin();
  const { data: project, error: projectError } = await supabase
    .from("mdt07_projects")
    .select("id")
    .eq("id", projectId)
    .eq("owner_github_id", ownerId)
    .maybeSingle();
  if (projectError) throw projectError;
  if (!project) return null;

  const { data: collection, error: collectionError } = await supabase
    .from("mdt07_collections")
    .select("id")
    .eq("project_id", projectId)
    .eq("owner_github_id", ownerId)
    .eq("name", collectionName.trim())
    .maybeSingle();
  if (collectionError) throw collectionError;
  if (!collection) return getProject(projectId);

  const sourceId = referenceId.startsWith("pinterest:")
    ? referenceId.slice("pinterest:".length)
    : referenceId;
  const { error } = await supabase
    .from("mdt07_references")
    .delete()
    .eq("collection_id", collection.id)
    .eq("owner_github_id", ownerId)
    .eq("source_id", sourceId);
  if (error) throw error;

  await audit("reference.removed", "reference", sourceId, { projectId });
  return getProject(projectId);
}

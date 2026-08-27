import "server-only";

import { deploymentConfig } from "@/lib/deployment";
import type { VisualReference } from "@/lib/pinterest/types";
import type { Json } from "@/lib/supabase/database.types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface ReferenceCollection {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  references: SavedReference[];
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "active" | "archived";
export type ReferenceWorkflowStatus = "saved" | "shortlisted" | "archived";

export interface ReferenceCatalogMetadata {
  recordId: string;
  notes: string;
  tags: string[];
  favorite: boolean;
  status: ReferenceWorkflowStatus;
  savedAt: string;
  updatedAt: string;
}

export interface SavedReference extends VisualReference {
  catalog: ReferenceCatalogMetadata;
}

export interface ResearchProject {
  id: string;
  name: string;
  brief: string;
  status: ProjectStatus;
  collections: ReferenceCollection[];
  createdAt: string;
  updatedAt: string;
}

function ownerGithubId(): string {
  const ownerId = deploymentConfig.ownerGithubId;
  if (!ownerId) throw new Error("OWNER_GITHUB_ID is required for project storage.");
  return ownerId;
}

async function touchProject(projectId: string, updatedAt = new Date().toISOString()): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("mdt07_projects")
    .update({ updated_at: updatedAt })
    .eq("id", projectId)
    .eq("owner_github_id", ownerGithubId());
  if (error) throw error;
}

function referenceFromJson(
  value: Json,
  catalog: ReferenceCatalogMetadata
): SavedReference {
  return { ...(value as unknown as VisualReference), catalog };
}

export async function recordAuditEvent(
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
    .select("id,name,brief,status,created_at,updated_at")
    .eq("owner_github_id", ownerId)
    .order("updated_at", { ascending: false });
  if (projectsError) throw projectsError;
  if (!projects?.length) return [];

  const projectIds = projects.map((project) => project.id);
  const [{ data: collections, error: collectionsError }, { data: references, error: referencesError }] =
    await Promise.all([
      supabase
        .from("mdt07_collections")
        .select("id,project_id,name,description,sort_order,created_at,updated_at")
        .eq("owner_github_id", ownerId)
        .in("project_id", projectIds)
        .order("updated_at", { ascending: false }),
      supabase
        .from("mdt07_references")
        .select("id,project_id,collection_id,reference_data,notes,tags,favorite,workflow_status,saved_at,updated_at")
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
    status: project.status,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    collections: (collections ?? [])
      .filter((collection) => collection.project_id === project.id)
      .map((collection) => ({
        id: collection.id,
        name: collection.name,
        description: collection.description,
        sortOrder: collection.sort_order,
        createdAt: collection.created_at,
        updatedAt: collection.updated_at,
        references: (references ?? [])
          .filter((reference) => reference.collection_id === collection.id)
          .map((reference) =>
            referenceFromJson(reference.reference_data, {
              recordId: reference.id,
              notes: reference.notes,
              tags: reference.tags,
              favorite: reference.favorite,
              status: reference.workflow_status,
              savedAt: reference.saved_at,
              updatedAt: reference.updated_at,
            })
          ),
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
    .select("id,name,brief,status,created_at,updated_at")
    .single();
  if (error) throw error;
  await recordAuditEvent("project.created", "project", data.id);
  return {
    id: data.id,
    name: data.name,
    brief: data.brief,
    status: data.status,
    collections: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateProject(
  id: string,
  updates: { name?: string; brief?: string; status?: ProjectStatus }
): Promise<ResearchProject | null> {
  const now = new Date().toISOString();
  const payload: { name?: string; brief?: string; status?: ProjectStatus; updated_at: string } = {
    updated_at: now,
  };
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.brief !== undefined) payload.brief = updates.brief.trim();
  if (updates.status !== undefined) payload.status = updates.status;

  const { data, error } = await getSupabaseAdmin()
    .from("mdt07_projects")
    .update(payload)
    .eq("id", id)
    .eq("owner_github_id", ownerGithubId())
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  await recordAuditEvent("project.updated", "project", id, {
    fields: Object.keys(updates),
  });
  return getProject(id);
}

export async function createCollection(
  projectId: string,
  name: string,
  description = ""
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

  const now = new Date().toISOString();
  const { error } = await supabase.from("mdt07_collections").insert({
    project_id: projectId,
    owner_github_id: ownerId,
    name: name.trim(),
    description: description.trim(),
    updated_at: now,
  });
  if (error) throw error;
  await touchProject(projectId, now);
  await recordAuditEvent("collection.created", "project", projectId, { name: name.trim() });
  return getProject(projectId);
}

export async function updateCollection(
  projectId: string,
  collectionId: string,
  updates: { name?: string; description?: string }
): Promise<ResearchProject | null> {
  const ownerId = ownerGithubId();
  const payload: { name?: string; description?: string; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.description !== undefined) payload.description = updates.description.trim();
  const { data, error } = await getSupabaseAdmin()
    .from("mdt07_collections")
    .update(payload)
    .eq("id", collectionId)
    .eq("project_id", projectId)
    .eq("owner_github_id", ownerId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  await touchProject(projectId, payload.updated_at);
  await recordAuditEvent("collection.updated", "collection", collectionId, {
    projectId,
    fields: Object.keys(updates),
  });
  return getProject(projectId);
}

export async function deleteCollection(
  projectId: string,
  collectionId: string
): Promise<ResearchProject | null> {
  const ownerId = ownerGithubId();
  const { data, error } = await getSupabaseAdmin()
    .from("mdt07_collections")
    .delete()
    .eq("id", collectionId)
    .eq("project_id", projectId)
    .eq("owner_github_id", ownerId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  await touchProject(projectId);
  await recordAuditEvent("collection.deleted", "collection", collectionId, { projectId });
  return getProject(projectId);
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
  await recordAuditEvent("project.deleted", "project", id);
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

  await touchProject(projectId, now);
  await recordAuditEvent("reference.saved", "reference", reference.sourceId, {
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

  await touchProject(projectId);
  await recordAuditEvent("reference.removed", "reference", sourceId, { projectId });
  return getProject(projectId);
}

export async function updateReferenceCatalog(
  projectId: string,
  collectionId: string,
  referenceRecordId: string,
  updates: {
    notes?: string;
    tags?: string[];
    favorite?: boolean;
    status?: ReferenceWorkflowStatus;
  }
): Promise<ResearchProject | null> {
  const ownerId = ownerGithubId();
  const payload: {
    notes?: string;
    tags?: string[];
    favorite?: boolean;
    workflow_status?: ReferenceWorkflowStatus;
    updated_at: string;
  } = { updated_at: new Date().toISOString() };
  if (updates.notes !== undefined) payload.notes = updates.notes.trim();
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.favorite !== undefined) payload.favorite = updates.favorite;
  if (updates.status !== undefined) payload.workflow_status = updates.status;

  const { data, error } = await getSupabaseAdmin()
    .from("mdt07_references")
    .update(payload)
    .eq("id", referenceRecordId)
    .eq("project_id", projectId)
    .eq("collection_id", collectionId)
    .eq("owner_github_id", ownerId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  await touchProject(projectId, payload.updated_at);
  await recordAuditEvent("reference.annotated", "reference", referenceRecordId, {
    projectId,
    collectionId,
    fields: Object.keys(updates),
  });
  return getProject(projectId);
}

export interface AuditEvent {
  id: number;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Json;
  createdAt: string;
}

export async function listAuditEvents(limit = 50): Promise<AuditEvent[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("mdt07_audit_events")
    .select("id,action,target_type,target_id,metadata,created_at")
    .eq("owner_github_id", ownerGithubId())
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(100, limit)));
  if (error) throw error;
  return (data ?? []).map((event) => ({
    id: event.id,
    action: event.action,
    targetType: event.target_type,
    targetId: event.target_id,
    metadata: event.metadata,
    createdAt: event.created_at,
  }));
}

export async function cleanupExpiredSecurityState(): Promise<{
  expiredConnections: number;
  expiredRateLimits: number;
}> {
  const { data, error } = await getSupabaseAdmin().rpc(
    "mdt07_cleanup_expired_security_state",
    {}
  );
  if (error) throw error;
  const result = data?.[0];
  return {
    expiredConnections: result?.expired_connections ?? 0,
    expiredRateLimits: result?.expired_rate_limits ?? 0,
  };
}

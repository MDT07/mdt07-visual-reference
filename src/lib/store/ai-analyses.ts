import "server-only";

import type {
  CatalogAnalysisResult,
  StoredCatalogAnalysis,
} from "@/lib/ai/catalog-types";
import { deploymentConfig } from "@/lib/deployment";
import type { Json } from "@/lib/supabase/database.types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function ownerGithubId(): string {
  const ownerId = deploymentConfig.ownerGithubId;
  if (!ownerId) throw new Error("OWNER_GITHUB_ID is required for AI analysis storage.");
  return ownerId;
}

function mapAnalysis(row: {
  id: string;
  project_id: string;
  model: string;
  prompt_version: string;
  input_fingerprint: string;
  input_summary: Json;
  result: Json;
  usage: Json;
  created_at: string;
}): StoredCatalogAnalysis {
  return {
    id: row.id,
    projectId: row.project_id,
    model: row.model,
    promptVersion: row.prompt_version,
    inputFingerprint: row.input_fingerprint,
    inputSummary: row.input_summary as unknown as StoredCatalogAnalysis["inputSummary"],
    result: row.result as unknown as CatalogAnalysisResult,
    usage: row.usage as unknown as StoredCatalogAnalysis["usage"],
    createdAt: row.created_at,
  };
}

export async function saveCatalogAnalysis(input: {
  projectId: string;
  promptVersion: string;
  model: string;
  inputFingerprint: string;
  inputSummary: StoredCatalogAnalysis["inputSummary"];
  result: CatalogAnalysisResult;
  usage: StoredCatalogAnalysis["usage"];
}): Promise<StoredCatalogAnalysis> {
  const { data, error } = await getSupabaseAdmin()
    .from("mdt07_ai_analyses")
    .insert({
      project_id: input.projectId,
      owner_github_id: ownerGithubId(),
      prompt_version: input.promptVersion,
      model: input.model,
      input_fingerprint: input.inputFingerprint,
      input_summary: input.inputSummary as unknown as Json,
      result: input.result as unknown as Json,
      usage: input.usage as unknown as Json,
    })
    .select("id,project_id,model,prompt_version,input_fingerprint,input_summary,result,usage,created_at")
    .single();
  if (error) throw error;
  return mapAnalysis(data);
}

export async function listCatalogAnalyses(
  projectId: string,
  limit = 10
): Promise<StoredCatalogAnalysis[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("mdt07_ai_analyses")
    .select("id,project_id,model,prompt_version,input_fingerprint,input_summary,result,usage,created_at")
    .eq("owner_github_id", ownerGithubId())
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(Math.max(1, Math.min(25, limit)));
  if (error) throw error;
  return (data ?? []).map(mapAnalysis);
}

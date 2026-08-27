import "server-only";

import { deploymentConfig } from "@/lib/deployment";
import type { Json } from "@/lib/supabase/database.types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface AuditEvent {
  id: number;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Json;
  createdAt: string;
}

function ownerGithubId(): string {
  if (!deploymentConfig.ownerGithubId) {
    throw new Error("OWNER_GITHUB_ID is required for security records.");
  }
  return deploymentConfig.ownerGithubId;
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

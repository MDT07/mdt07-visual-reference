import "server-only";

import { createAdminClient } from "@supabase/server/core";

import type { Database } from "@/lib/supabase/database.types";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SECRET_KEY?.trim().startsWith("sb_secret_")
  );
}

export function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY on the server."
    );
  }

  return createAdminClient<Database>();
}

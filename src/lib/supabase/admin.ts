import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class SupabaseConfigError extends Error {
  readonly isSupabaseConfigError = true;

  constructor() {
    super(
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Secret / service_role key, not the publishable key)."
    );
    this.name = "SupabaseConfigError";
  }
}

export function isSupabaseConfigError(
  e: unknown
): e is SupabaseConfigError {
  return (
    typeof e === "object" &&
    e !== null &&
    "isSupabaseConfigError" in e &&
    (e as SupabaseConfigError).isSupabaseConfigError === true
  );
}

export function createAdminClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new SupabaseConfigError();
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

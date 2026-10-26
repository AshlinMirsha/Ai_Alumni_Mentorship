import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSupabaseUrl } from "./client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jbgyjfauypzbzsnplrws.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Checks whether Supabase Service Role key is configured.
 */
export function isServiceRoleConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    serviceRoleKey &&
    serviceRoleKey.length > 20 &&
    !serviceRoleKey.includes("your-service-role-key")
  );
}

export function createAdminClient() {
  const url = sanitizeSupabaseUrl(supabaseUrl) || "https://jbgyjfauypzbzsnplrws.supabase.co";
  const key = serviceRoleKey || anonKey || "";

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

let adminClientInstance: SupabaseClient | null = null;

/**
 * Returns the singleton privileged Supabase Admin client for trusted server-side operations.
 * NEVER import or execute this on the client side.
 */
export function getAdminClient(): SupabaseClient {
  if (adminClientInstance) return adminClientInstance;

  const url = sanitizeSupabaseUrl(supabaseUrl) || "https://placeholder-project.supabase.co";
  // In development/test environments where service role key might be omitted, fall back to anon key
  const key = isServiceRoleConfigured() ? serviceRoleKey!.trim() : (anonKey?.trim() || "placeholder-key");

  if (!isServiceRoleConfigured()) {
    console.warn(
      "[Supabase Admin] SUPABASE_SERVICE_ROLE_KEY is not set. Using fallback anon key for server operations. For full RLS bypass and atomic admin operations, configure SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }

  adminClientInstance = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClientInstance;
}

export const adminSupabase = getAdminClient();


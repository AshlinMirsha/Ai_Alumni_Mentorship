import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Sanitizes Supabase URL to ensure it points to the base project domain
 * and removes any accidental /rest/v1 path or trailing slashes.
 */
export function sanitizeSupabaseUrl(url?: string): string {
  if (!url) return "";
  let clean = url.trim();
  clean = clean.replace(/\/+$/, "");
  clean = clean.replace(/\/rest\/v1\/?$/, "");
  return clean;
}

/**
 * Checks whether Supabase environment variables are properly configured.
 */
export function isSupabaseConfigured(): boolean {
  const cleanUrl = sanitizeSupabaseUrl(supabaseUrl);
  return Boolean(
    cleanUrl &&
    supabaseAnonKey &&
    cleanUrl.startsWith("http") &&
    !cleanUrl.includes("your-supabase-project") &&
    supabaseAnonKey.trim().length > 20
  );
}

// Fallback dummy URL and Key for build-time static generation when env vars are unset
const DEFAULT_URL = "https://placeholder-project.supabase.co";
const DEFAULT_KEY = "placeholder-anon-key-placeholder-anon-key-placeholder-anon-key";

let clientInstance: SupabaseClient | null = null;

/**
 * Returns the singleton browser Supabase client.
 */
export function getSupabaseClient(): SupabaseClient {
  if (clientInstance) return clientInstance;

  const url = isSupabaseConfigured() ? sanitizeSupabaseUrl(supabaseUrl) : DEFAULT_URL;
  const key = isSupabaseConfigured() ? supabaseAnonKey!.trim() : DEFAULT_KEY;

  if (typeof window !== "undefined" && !isSupabaseConfigured()) {
    console.warn(
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured. Running in demo mode. Configure your .env.local file to enable live authentication."
    );
  }

  clientInstance = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "alumnipath_supabase_auth_token",
    },
  });

  return clientInstance;
}

export const supabase = getSupabaseClient();

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();
  return url && key ? { url, key } : null;
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseCredentials());
}

export function createPublicSupabaseClient(): SupabaseClient | null {
  const credentials = getSupabaseCredentials();
  if (!credentials) return null;

  return createClient(credentials.url, credentials.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

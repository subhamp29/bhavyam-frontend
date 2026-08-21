import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      // During build / missing config, return a no-op client so imports don't crash.
      _supabase = createClient(supabaseUrl || "http://localhost", supabaseAnonKey || "anon", {
        auth: { persistSession: false },
      });
    } else {
      _supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    }
  }
  return _supabase;
}

// Default export for convenience, but prefer getSupabase() in client code.
export const supabase = typeof window !== "undefined" ? getSupabase() : (null as any);

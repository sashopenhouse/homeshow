import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client — bypasses Row Level Security entirely.
// Only import this from server-side code (API routes, Server Components).
// The `server-only` import above makes accidentally bundling this into a
// "use client" component a build-time error rather than a leaked secret.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — set SUPABASE_SERVICE_ROLE_KEY in your environment (Supabase project settings → API → service_role key). Never expose this key to the browser."
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

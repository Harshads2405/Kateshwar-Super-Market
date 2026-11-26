import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER ONLY. Import this module only from trusted server-side code.
// Never expose the service-role key to the browser.
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("The Supabase admin client must never run in the browser.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerEnv } from "@/lib/supabase/env";

export function createSupabaseServiceClient() {
  const env = getSupabaseServerEnv();

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

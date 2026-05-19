import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseClientEnv } from "@/lib/supabase/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const env = getSupabaseClientEnv();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          // Supabase calls setAll when refreshing the session. In Server Components,
          // cookies cannot be modified - this throws "Cookies can only be modified in
          // a Server Action or Route Handler".
          //
          // We suppress this error and rely on the client-side Supabase Auth helpers
          // to manage the session. The cookie values are still read via getAll().
          // This error suppression is safe because:
          // 1. Auth state is persisted in cookies (read via getAll())
          // 2. Session refresh will happen client-side or in allowed contexts
          // 3. Server Actions and Route Handlers can still modify cookies
          for (const { name, value, options } of cookiesToSet) {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Silently ignore - cookie setting not allowed in this context
              // This is expected in Server Components
            }
          }
        },
      },
    },
  );
}

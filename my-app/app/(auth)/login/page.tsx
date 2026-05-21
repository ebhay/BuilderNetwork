import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/components/auth-form";
import { getCurrentUser, getProfile } from "@/lib/auth/session";
import { getOptionalGoogleAuthEnv, isSupabaseConfigured } from "@/lib/supabase/env";
import { Card, CardContent } from "@/components/ui/card";

export default async function LoginPage() {
  const { SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_SITE_URL } = getOptionalGoogleAuthEnv();

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
        <Card className="w-full border border-border">
          <CardContent className="pt-6 text-muted-foreground">
            Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
            in your local environment to enable login.
          </CardContent>
        </Card>
      </main>
    );
  }

  const user = await getCurrentUser();
  if (user) {
    const profile = await getProfile(user.id);
    if (!profile?.onboarded_at) redirect("/onboarding");
    redirect("/ideas");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#c9e8ff_0%,#f3f8ff_55%,#ffffff_100%)] px-6 py-10">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.95)_0%,_rgba(255,255,255,0.65)_55%,_transparent_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-96 w-[46rem] -translate-x-1/2 rounded-full border border-white/45" />
      <div className="pointer-events-none absolute left-1/2 top-32 h-[32rem] w-[58rem] -translate-x-1/2 rounded-full border border-white/35" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <AuthForm
          googleEnabled={Boolean(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)}
          siteUrl={NEXT_PUBLIC_SITE_URL ?? null}
        />
      </div>
    </main>
  );
}

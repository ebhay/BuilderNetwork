import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(redirectTo?: string) {
  const user = await getCurrentUser();
  if (!user) {
    const next = redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : "";
    redirect(`/login${next}`);
  }
  return user;
}

export async function getProfile(userId: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("id,name,username,onboarded_at,profile_image_url")
    .eq("id", userId)
    .maybeSingle();
  return data;
}

export async function requireOnboarded(userId: string, currentPath: string) {
  const profile = await getProfile(userId);
  if (!profile?.onboarded_at) {
    redirect(`/onboarding?next=${encodeURIComponent(currentPath)}`);
  }
}

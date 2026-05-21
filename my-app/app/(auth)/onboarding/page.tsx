import { redirect } from "next/navigation";
import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";
import { getProfile, requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";

type Props = {
  searchParams: Promise<{ next?: string; edit?: string }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const user = await requireUser("/onboarding");
  const profile = await getProfile(user.id);

  const { next: nextParam, edit } = await searchParams;
  const isEdit = edit === "1";
  if (profile?.onboarded_at && !isEdit) {
    redirect(nextParam ?? "/ideas");
  }

  const supabase = await createSupabaseServerClient();
  const { data: skills } = await supabase
    .from("skills")
    .select("name,level")
    .eq("user_id", user.id);

  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("type,url,is_public")
    .eq("user_id", user.id);
  const { data: profileExtra } = await supabase
    .from("profiles")
    .select("headline,location")
    .eq("id", user.id)
    .maybeSingle();

  const form = (
    <OnboardingForm
      nextPath={nextParam ?? "/ideas"}
      showIntroPanel={!isEdit}
      initialData={{
        name: profile?.name ?? "",
        username: profile?.username ?? "",
        headline: profileExtra?.headline ?? "",
        location: profileExtra?.location ?? "",
        bio: profile?.bio ?? "",
        codingLevel: (profile?.coding_level as "BEGINNER" | "INTERMEDIATE" | "EXPERT" | null) ?? "BEGINNER",
        profileImageUrl: profile?.profile_image_url ?? "",
        skills: (skills ?? []).map((skill) => ({ name: skill.name, level: skill.level })),
        socialLinks: (socialLinks ?? []).map((link) => ({
          type: link.type,
          url: link.url,
          isPublic: link.is_public,
        })),
      }}
    />
  );

  if (!isEdit) {
    return (
      <main className="h-screen overflow-hidden bg-[linear-gradient(180deg,#f4f8ff_0%,#ffffff_60%)] px-1.5 py-4">
        <div className="mx-auto h-full w-full max-w-[92rem]">{form}</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen lg:h-screen w-full flex-col lg:flex-row gap-0 overflow-hidden bg-background">
      <AppSidebar
        active="manage-profile"
        user={{
          id: user.id,
          email: user.email,
          name: profile?.name,
          username: profile?.username,
          profileImageUrl: profile?.profile_image_url,
        }}
      />
      <div className="min-w-0 flex-1 overflow-y-auto px-4 md:px-8 py-0 bg-background lg:h-full hide-scrollbar">
        {form}
      </div>
    </main>
  );
}

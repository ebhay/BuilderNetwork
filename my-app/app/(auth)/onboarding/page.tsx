import { redirect } from "next/navigation";
import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";
import { getProfile, requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  return (
    <main className="h-screen overflow-hidden bg-[linear-gradient(180deg,#f4f8ff_0%,#ffffff_60%)] px-1.5 py-4">
      <div className="mx-auto h-full w-full max-w-[92rem]">
        <OnboardingForm
          nextPath={nextParam ?? "/ideas"}
          initialData={{
            name: profile?.name ?? "",
            username: profile?.username ?? "",
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
      </div>
    </main>
  );
}

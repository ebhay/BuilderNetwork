import { IdeaSubmitForm } from "@/features/ideas/components/idea-submit-form";
import { requireOnboarded, requireUser, getProfile } from "@/lib/auth/session";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function SubmitIdeaPage() {
  const user = await requireUser("/ideas/submit");
  await requireOnboarded(user.id, "/ideas/submit");
  const profile = await getProfile(user.id);

  return (
    <main className="flex min-h-screen lg:h-screen w-full flex-col lg:flex-row gap-0 overflow-hidden bg-background">
      <AppSidebar
        active="ideas"
        user={{
          id: user.id,
          email: user.email,
          name: profile?.name,
          username: profile?.username,
          profileImageUrl: profile?.profile_image_url,
        }}
      />

      <div className="min-w-0 flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-background lg:h-full hide-scrollbar">
        <div className="mx-auto w-full max-w-3xl">
          <IdeaSubmitForm />
        </div>
      </div>
    </main>
  );
}

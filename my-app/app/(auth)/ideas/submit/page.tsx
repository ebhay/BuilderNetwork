import { IdeaSubmitForm } from "@/features/ideas/components/idea-submit-form";
import { requireOnboarded, requireUser } from "@/lib/auth/session";

export default async function SubmitIdeaPage() {
  const user = await requireUser("/ideas/submit");
  await requireOnboarded(user.id, "/ideas/submit");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <IdeaSubmitForm />
    </main>
  );
}

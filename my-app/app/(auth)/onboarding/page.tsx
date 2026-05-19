import { redirect } from "next/navigation";
import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";
import { getProfile, requireUser } from "@/lib/auth/session";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function OnboardingPage({ searchParams }: Props) {
  const user = await requireUser("/onboarding");
  const profile = await getProfile(user.id);

  const { next: nextParam } = await searchParams;
  if (profile?.onboarded_at) {
    redirect(nextParam ?? "/ideas");
  }

  return (
    <main className="h-screen overflow-hidden bg-[linear-gradient(180deg,#f4f8ff_0%,#ffffff_60%)] px-1.5 py-4">
      <div className="mx-auto h-full w-full max-w-[92rem]">
        <OnboardingForm nextPath={nextParam ?? "/ideas"} />
      </div>
    </main>
  );
}

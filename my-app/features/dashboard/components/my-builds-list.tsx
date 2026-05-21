import { ImplementationCard } from "@/features/implementations/components/implementation-card";

export function MyBuildsList({
  builds,
}: {
  builds: Array<{
    id: string;
    build_title: string | null;
    github_repo_url: string;
    deployed_url: string | null;
    status: "IN_PROGRESS" | "BUILT";
    target_completion_time: string | null;
    created_at: string;
    ideas: { title: string | null } | null;
    leadName?: string | null;
    leadProfileHref?: string | null;
    commitCount?: number | null;
  }>;
}) {
  if (builds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border p-12 text-center text-muted-foreground">
        <p>You haven&apos;t started building any ideas yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {builds.map((build) => (
        <ImplementationCard
          key={build.id}
          implementation={build}
          ideaTitle={build.ideas?.title ?? "Idea"}
          leadName={build.leadName ?? "You"}
          leadProfileHref={build.leadProfileHref ?? null}
          commitCount={build.commitCount ?? null}
        />
      ))}
    </div>
  );
}

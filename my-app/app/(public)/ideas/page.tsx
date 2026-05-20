import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { IdeaCard } from "@/features/ideas/components/idea-card";
import { IdeaFilters } from "@/features/ideas/components/idea-filters";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Card, CardContent } from "@/components/ui/card";
import { fetchIdeaStatsMap } from "@/lib/ideas/status";
import { getCurrentUser, getProfile } from "@/lib/auth/session";
import { AppSidebar } from "@/components/layout/app-sidebar";

type Props = {
  searchParams: Promise<{
    skill?: string;
    level?: "BEGINNER" | "INTERMEDIATE" | "EXPERT" | "ALL";
    status?: "IDEA" | "IN_PROGRESS" | "BUILT" | "ALL";
    minScore?: string;
    sort?: "recent" | "score";
  }>;
};

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Idea Feed | Builder Network",
  description: "Browse published ideas and ideas marked as needs refinement.",
};

export default async function IdeasPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <Card className="border border-border">
          <CardContent className="pt-6 text-muted-foreground">
            Feed is unavailable until Supabase environment variables are configured.
          </CardContent>
        </Card>
      </main>
    );
  }
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  const profile = user ? await getProfile(user.id) : null;

  let query = supabase
    .from("ideas")
    .select(
      "id,title,description,visibility,quality_score,project_level,tags,required_skills,created_at,profiles:posted_by_user_id(name,username)",
    )
    .in("visibility", ["PUBLISHED", "NEEDS_REFINEMENT"])
    .limit(30);

  if (params.level && params.level !== "ALL") {
    query = query.eq("project_level", params.level);
  }
  if (params.skill) {
    query = query.contains("required_skills", [params.skill]);
  }
  if (params.minScore) {
    const score = Number.parseFloat(params.minScore);
    if (!Number.isNaN(score)) query = query.gte("quality_score", score);
  }
  if (params.sort === "score") {
    query = query.order("quality_score", { ascending: false, nullsFirst: false });
  } else {
    query = query
      .order("visibility", { ascending: true })
      .order("created_at", { ascending: false });
  }

  const { data: ideas } = await query;
  const statsMap = await fetchIdeaStatsMap(
    supabase as never,
    (ideas ?? []).map((idea) => idea.id),
  );

  const filteredIdeas = (ideas ?? []).filter((idea) => {
    const stats = statsMap[idea.id]?.derivedStatus ?? "IDEA";
    if (!params.status || params.status === "ALL") return true;
    return stats === params.status;
  });

  return (
    <main className="flex h-screen w-full gap-6 overflow-hidden pb-8">
      <AppSidebar
        active="ideas"
        user={
          user
            ? {
                id: user.id,
                email: user.email,
                name: profile?.name,
                username: profile?.username,
                profileImageUrl: profile?.profile_image_url,
              }
            : null
        }
      />

      <div className="hide-scrollbar min-w-0 flex-1 space-y-6 overflow-y-auto px-6 pt-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-semibold text-ink">Explore Ideas</h1>
            <p className="text-sm text-muted-foreground">
              Discover ideas and problems worth building.
            </p>
          </div>
          <Link href="/ideas/submit" className={buttonVariants({ variant: "default" })}>
            Submit an idea
          </Link>
        </header>
        <IdeaFilters searchParams={params} />
        {filteredIdeas.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="mb-4 text-muted-foreground">No ideas match your current filters.</p>
              <Link href="/ideas/submit" className={buttonVariants({ variant: "default" })}>
                Be the first to submit one
              </Link>
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {filteredIdeas.map((idea) => {
              const stats = statsMap[idea.id] ?? {
                derivedStatus: "IDEA" as const,
                implementationCount: 0,
                builtCount: 0,
              };
              return (
                <IdeaCard
                  key={idea.id}
                  idea={{
                    ...idea,
                    ...stats,
                  }}
                />
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

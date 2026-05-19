import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewResultPanel } from "@/features/ideas/components/review-result-panel";
import { IdeaStatusBadge } from "@/features/ideas/components/idea-status-badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { fetchIdeaStatsMap } from "@/lib/ideas/status";
import { getCurrentUser } from "@/lib/auth/session";
import { StartImplementationForm } from "@/features/implementations/components/start-implementation-form";
import { toggleSavedIdeaAction } from "@/features/implementations/actions";
import { ImplementationCard } from "@/features/implementations/components/implementation-card";

import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured()) return { title: "Idea Details | Builder Network" };
  
  const supabase = await createSupabaseServerClient();
  const { data: idea } = await supabase
    .from("ideas")
    .select("title,description")
    .eq("id", id)
    .maybeSingle();

  if (!idea) return { title: "Idea Not Found | Builder Network" };

  return {
    title: `${idea.title} | Builder Network`,
    description: idea.description.slice(0, 160),
  };
}

export default async function IdeaDetailPage({ params }: Props) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10 text-muted-foreground">
        Configure Supabase environment values to view idea details.
      </main>
    );
  }

  const { id } = await params;
  const user = await getCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { data: idea } = await supabase
    .from("ideas")
    .select("*,profiles:posted_by_user_id(name)")
    .eq("id", id)
    .in("visibility", ["PUBLISHED", "NEEDS_REFINEMENT"])
    .maybeSingle();

  if (!idea) notFound();

  const stats = (await fetchIdeaStatsMap(supabase as never, [idea.id]))[idea.id] ?? {
    derivedStatus: "IDEA" as const,
    implementationCount: 0,
    builtCount: 0,
  };

  const { data: implementations } = await supabase
    .from("implementations")
    .select("id,build_title,github_repo_url,deployed_url,status,target_completion_time,created_at")
    .eq("idea_id", idea.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: saved } = user
    ? await supabase
        .from("saved_ideas")
        .select("id")
        .eq("user_id", user.id)
        .eq("idea_id", idea.id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <IdeaStatusBadge visibility={idea.visibility} />
          {idea.quality_score ? (
            <Badge variant="outline" className="rounded-md">
              Score {idea.quality_score.toFixed(1)}
            </Badge>
          ) : null}
          {idea.project_level ? (
            <Badge variant="outline" className="rounded-md">
              {idea.project_level}
            </Badge>
          ) : null}
          <Badge variant="outline" className="rounded-md">
            {stats.derivedStatus}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {stats.implementationCount} builds
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {stats.builtCount} built
          </Badge>
        </div>
        <h1 className="font-heading text-3xl font-semibold text-ink">{idea.title}</h1>
        <p className="text-muted-foreground">Idea by {idea.profiles?.name ?? "Unknown builder"}</p>
      </header>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Idea details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{idea.description}</p>
          <div className="flex flex-wrap gap-2">
            {(idea.required_skills ?? []).map((skill: string) => (
              <Badge key={skill} variant="outline" className="rounded-md">
                {skill}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(idea.tags ?? []).map((tag: string) => (
              <Badge key={tag} variant="outline" className="rounded-md">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {idea.ai_feedback_json ? <ReviewResultPanel review={idea.ai_feedback_json} /> : null}

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Implementations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <StartImplementationForm ideaId={idea.id} />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Log in to start building this idea.</p>
              <Link
                href={`/login?next=${encodeURIComponent(`/ideas/${idea.id}`)}`}
                className={buttonVariants({ variant: "default" })}
              >
                Log in to start building
              </Link>
            </div>
          )}

          {user ? (
            <form action={toggleSavedIdeaAction}>
              <input type="hidden" name="ideaId" value={idea.id} />
              <button className={buttonVariants({ variant: "outline" })} type="submit">
                {saved ? "Unsave idea" : "Save idea"}
              </button>
            </form>
          ) : null}

          <section className="grid gap-3 md:grid-cols-2">
            {(implementations ?? []).map((implementation) => (
              <ImplementationCard
                key={implementation.id}
                implementation={implementation}
                ideaTitle={idea.title}
              />
            ))}
          </section>
        </CardContent>
      </Card>

      <Link href="/ideas" className={buttonVariants({ variant: "outline" })}>
        Back to feed
      </Link>
    </main>
  );
}

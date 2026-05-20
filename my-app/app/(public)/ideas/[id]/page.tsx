import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewResultPanel } from "@/features/ideas/components/review-result-panel";
import { IdeaStatusBadge } from "@/features/ideas/components/idea-status-badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { fetchIdeaStatsMap } from "@/lib/ideas/status";
import { getCurrentUser, getProfile } from "@/lib/auth/session";
import { ImplementationCard } from "@/features/implementations/components/implementation-card";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { IdeaDetailActions } from "@/features/ideas/components/idea-detail-actions";

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
  const viewerProfile = user ? await getProfile(user.id) : null;
  const supabase = await createSupabaseServerClient();

  const { data: idea } = await supabase
    .from("ideas")
    .select("*")
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

  const implementationIds = (implementations ?? []).map((item) => item.id);
  const { data: teamRows } = implementationIds.length
    ? await supabase
        .from("implementation_members_public")
        .select("implementation_id,user_id,name,profile_image_url,role")
        .in("implementation_id", implementationIds)
    : {
        data: [] as Array<{
          implementation_id: string;
          user_id: string;
          name: string | null;
          profile_image_url: string | null;
          role: "LEAD" | "TEAMMATE";
        }>,
      };

  const teamMap = new Map<
    string,
    {
      leadName: string;
      membersCount: number;
      avatars: Array<{ userId: string; profileImageUrl: string | null; name: string | null }>;
    }
  >();
  for (const implementation of implementations ?? []) {
    const rows = (teamRows ?? []).filter((row) => row.implementation_id === implementation.id);
    const lead = rows.find((row) => row.role === "LEAD");
    teamMap.set(implementation.id, {
      leadName: lead?.name ?? "Unknown builder",
      membersCount: rows.length,
      avatars: rows.map((row) => ({ userId: row.user_id, profileImageUrl: row.profile_image_url, name: row.name })),
    });
  }

  const { data: saved } = user
    ? await supabase
        .from("saved_ideas")
        .select("id")
        .eq("user_id", user.id)
        .eq("idea_id", idea.id)
        .maybeSingle()
    : { data: null };

  const { data: authorProfile } = await supabase
    .from("profiles")
    .select("id,name,username,headline,profile_image_url")
    .eq("id", idea.posted_by_user_id)
    .maybeSingle();
  const authorLabel = authorProfile?.username ? `@${authorProfile.username}` : (authorProfile?.name ?? "Unknown builder");

  const review = idea.ai_feedback_json as
    | {
        qualityScore?: number;
        qualityBand?: string;
        worthinessReview?: string;
        feasibilityReview?: string;
      }
    | null;

  return (
    <main className="flex h-screen w-full gap-6 overflow-hidden">
      {user ? (
        <AppSidebar
          active="ideas"
          user={{
            id: user.id,
            email: user.email,
            name: viewerProfile?.name,
            username: viewerProfile?.username,
            profileImageUrl: viewerProfile?.profile_image_url,
          }}
        />
      ) : null}

      <section className="hide-scrollbar min-w-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/ideas" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              ← Back to ideas
            </Link>
            {user ? (
              <IdeaDetailActions ideaId={idea.id} isSaved={Boolean(saved)} className="w-full sm:w-auto" />
            ) : (
              <Link href={`/login?next=${encodeURIComponent(`/ideas/${idea.id}`)}`} className={buttonVariants({ variant: "default" })}>
                Log in to start building
              </Link>
            )}
          </div>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <header className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <IdeaStatusBadge visibility={idea.visibility} />
                  {idea.quality_score ? <Badge variant="outline" className="rounded-md">Score {idea.quality_score.toFixed(1)}</Badge> : null}
                  {idea.project_level ? <Badge variant="outline" className="rounded-md">{idea.project_level}</Badge> : null}
                  <Badge variant="outline" className="rounded-md">{stats.implementationCount} builds</Badge>
                  <Badge variant="outline" className="rounded-md">{stats.builtCount} built</Badge>
                </div>
                <h1 className="font-heading text-4xl font-semibold leading-tight text-ink">{idea.title}</h1>
                <p className="text-sm text-muted-foreground">Idea by {authorLabel}</p>
              </header>

              <div className="flex flex-wrap gap-2 border-b border-border pb-2">
                <Badge className="rounded-md bg-accent text-primary">Overview</Badge>
                <Badge variant="outline" className="rounded-md">AI Review</Badge>
                <Badge variant="outline" className="rounded-md">Implementations ({stats.implementationCount})</Badge>
              </div>

              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="font-heading text-xl">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">{idea.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-ink">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {(idea.tags ?? []).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="rounded-md">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-ink">Required skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(idea.required_skills ?? []).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="rounded-md">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {idea.ai_feedback_json ? <ReviewResultPanel review={idea.ai_feedback_json} /> : null}
            </div>

            <aside className="space-y-4">
              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">AI Review Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-4xl font-semibold text-ink">{(review?.qualityScore ?? idea.quality_score ?? 0).toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">{review?.qualityBand ?? "No band yet"}</p>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between"><span className="text-muted-foreground">Worthiness</span><span>{review?.worthinessReview ? "Good" : "-"}</span></p>
                    <p className="flex justify-between"><span className="text-muted-foreground">Feasibility</span><span>{review?.feasibilityReview ? "Good" : "-"}</span></p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">About the creator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-muted">
                      {authorProfile?.profile_image_url ? (
                        <Image src={authorProfile.profile_image_url} alt={authorProfile.name ?? "Creator"} width={40} height={40} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-ink">
                          {(authorProfile?.name?.slice(0, 1) ?? "U").toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{authorProfile?.name ?? "Unknown builder"}</p>
                      <p className="text-xs text-muted-foreground">{authorProfile?.headline ?? "Active builder"}</p>
                    </div>
                  </div>
                  <Link href={authorProfile?.username ? `/u/${authorProfile.username}` : "#"} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                    View profile
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-none">
                <CardContent className="space-y-4 p-0">
                  <section className="grid gap-3">
                    {(implementations ?? []).map((implementation) => (
                      <ImplementationCard
                        key={implementation.id}
                        implementation={implementation}
                        ideaTitle={idea.title}
                        leadName={teamMap.get(implementation.id)?.leadName}
                        membersCount={teamMap.get(implementation.id)?.membersCount}
                        teamAvatars={teamMap.get(implementation.id)?.avatars}
                      />
                    ))}
                  </section>
                </CardContent>
              </Card>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

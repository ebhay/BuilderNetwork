import { requireOnboarded, requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MyIdeasList } from "@/features/dashboard/components/my-ideas-list";
import { MyBuildsList } from "@/features/dashboard/components/my-builds-list";
import { DraftsList } from "@/features/dashboard/components/drafts-list";
import { SavedIdeasList } from "@/features/dashboard/components/saved-ideas-list";
import { fetchIdeaStatsMap } from "@/lib/ideas/status";
import { ReceivedJoinRequestsList } from "@/features/join-requests/components/received-join-requests-list";
import { SentJoinRequestsList } from "@/features/join-requests/components/sent-join-requests-list";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SummaryCards } from "@/features/dashboard/components/summary-cards";
import { QualityChart } from "@/features/dashboard/components/quality-chart";
import { DashboardTabs } from "@/features/dashboard/components/dashboard-tabs";
import { Badge } from "@/components/ui/badge";
import { firstRelation } from "@/lib/supabase/relations";
import { getGithubCommitCounts } from "@/lib/github/commits";

type Props = {
  searchParams: Promise<{ tab?: "ideas" | "builds" | "requests" | "drafts" | "saved" }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const user = await requireUser("/dashboard");
  await requireOnboarded(user.id, "/dashboard");
  const { tab: searchTab } = await searchParams;
  const tab = searchTab === "requests" ? "builds" : (searchTab ?? "ideas");
  const supabase = await createSupabaseServerClient();

  const { data: myIdeasRaw } = await supabase
    .from("ideas")
    .select("id,title,visibility,review_status,quality_score")
    .eq("posted_by_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("name,username,profile_image_url")
    .eq("id", user.id)
    .maybeSingle();

  const statsMap = await fetchIdeaStatsMap(
    supabase as never,
    (myIdeasRaw ?? []).map((idea) => idea.id),
  );

  const myIdeas = (myIdeasRaw ?? []).map((idea) => ({
    ...idea,
    implementationCount: statsMap[idea.id]?.implementationCount ?? 0,
    builtCount: statsMap[idea.id]?.builtCount ?? 0,
  }));

  const { data: myBuilds } = await supabase
    .from("implementations")
    .select("id,build_title,github_repo_url,deployed_url,status,target_completion_time,created_at,ideas(title),profiles:lead_user_id(name,username,profile_image_url)")
    .eq("lead_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  const { data: joinedBuildMemberships } = await supabase
    .from("implementation_members")
    .select("implementation_id")
    .eq("user_id", user.id)
    .neq("role", "LEAD")
    .limit(40);

  const joinedBuildIds = (joinedBuildMemberships ?? []).map((row) => row.implementation_id);
  const { data: joinedBuilds } = joinedBuildIds.length
    ? await supabase
        .from("implementations")
        .select("id,build_title,github_repo_url,deployed_url,status,target_completion_time,created_at,ideas(title),profiles:lead_user_id(name,username,profile_image_url)")
        .in("id", joinedBuildIds)
    : { data: [] as never[] };

const buildMap = new Map<string, BuildRow>();
if (myBuilds) {
  for (const item of (myBuilds ?? []) as BuildRow[]) buildMap.set(item.id, item);
}
if (joinedBuilds) {
  for (const item of (joinedBuilds ?? []) as BuildRow[]) buildMap.set(item.id, item);
}

const mergedBuilds = Array.from(buildMap.values()).sort((a, b) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
);
const commitCountMap = await getGithubCommitCounts(
  mergedBuilds.map((build) => build.github_repo_url),
);



const { data: drafts } = await supabase
  .from("ideas")
  .select("id,title,review_status,visibility")
  .eq("posted_by_user_id", user.id)
  .or("visibility.eq.DRAFT,review_status.eq.PENDING_REVIEW,review_status.eq.ERROR")
  .order("created_at", { ascending: false })
  .limit(40);

const draftCount = drafts?.length ?? 0;

const { data: savedIdeas } = await supabase
  .from("saved_ideas")
  .select("ideas!inner(id,title,quality_score)")
  .eq("user_id", user.id)
  .limit(40);

  const ownedBuildIds = (myBuilds ?? []).map((build) => build.id);
  const { data: receivedRaw } = ownedBuildIds.length
    ? await supabase
        .from("join_requests")
        .select("id,implementation_id,message,status,requester_user_id")
        .in("implementation_id", ownedBuildIds)
        .limit(80)
    : { data: [] as never[] };

  const requesterIds = Array.from(new Set((receivedRaw ?? []).map((row) => row.requester_user_id)));
  const implementationIds = Array.from(new Set((receivedRaw ?? []).map((row) => row.implementation_id)));

  const { data: requesterProfiles } = requesterIds.length
    ? await supabase.from("profiles").select("id,name,coding_level").in("id", requesterIds)
    : { data: [] as never[] };

  const { data: receivedImplementations } = implementationIds.length
    ? await supabase
        .from("implementations")
        .select("id,build_title,ideas(title)")
        .in("id", implementationIds)
    : { data: [] as never[] };

  const requesterMap = new Map((requesterProfiles ?? []).map((profile) => [profile.id, profile]));
  const implementationMap = new Map(
    (receivedImplementations ?? []).map((implementation) => [implementation.id, implementation]),
  );

  const receivedRequests = (receivedRaw ?? []).map((item) => {
    const build = implementationMap.get(item.implementation_id);
    return {
      id: item.id,
      implementation_id: item.implementation_id,
      message: item.message,
      status: item.status,
      requester: requesterMap.get(item.requester_user_id) ?? null,
      implementationTitle: build?.build_title ?? "",
      ideaTitle: firstRelation(build?.ideas as { title: string | null }[] | { title: string | null } | null)?.title ?? "Idea",
    };
  });

  const { data: sentRaw } = await supabase
    .from("join_requests")
    .select("id,implementation_id,status")
    .eq("requester_user_id", user.id)
    .limit(80);

  const sentImplementationIds = Array.from(new Set((sentRaw ?? []).map((row) => row.implementation_id)));
  const { data: sentImplementations } = sentImplementationIds.length
    ? await supabase
        .from("implementations")
        .select("id,build_title,lead_user_id,ideas(title)")
        .in("id", sentImplementationIds)
    : { data: [] as never[] };

  const leadIds = Array.from(
    new Set((sentImplementations ?? []).map((implementation) => implementation.lead_user_id)),
  );
  const { data: leads } = leadIds.length
    ? await supabase.from("profiles").select("id,name,coding_level").in("id", leadIds)
    : { data: [] as never[] };
  const leadMap = new Map((leads ?? []).map((profile) => [profile.id, profile]));
  const sentImplMap = new Map((sentImplementations ?? []).map((implementation) => [implementation.id, implementation]));

  const sentRequests = (sentRaw ?? []).map((item) => {
    const build = sentImplMap.get(item.implementation_id);
    return {
      id: item.id,
      implementation_id: item.implementation_id,
      status: item.status,
      implementationTitle: build?.build_title ?? "",
      ideaTitle: firstRelation(build?.ideas as { title: string | null }[] | { title: string | null } | null)?.title ?? "Idea",
      lead: build ? (leadMap.get(build.lead_user_id) ?? null) : null,
    };
  });

  const publishedCount = myIdeas.filter((idea) => idea.visibility === "PUBLISHED").length;
  const activeBuildCount = mergedBuilds.filter((build) => build.status === "IN_PROGRESS").length;
  const receivedPendingCount = receivedRequests.filter((request) => request.status === "PENDING").length;
  const avgScore =
    myIdeas.filter((idea) => idea.quality_score !== null).length > 0
      ? (
          myIdeas.reduce((sum, idea) => sum + (idea.quality_score ?? 0), 0) /
          myIdeas.filter((idea) => idea.quality_score !== null).length
        ).toFixed(1)
      : "0.0";

  const sectionMeta = {
    ideas: {
      title: "My Ideas",
      description: "Track quality, review status, and build activity for ideas you submitted.",
    },
    builds: {
      title: "My Builds",
      description: "See implementation progress, repositories, and build status in one place.",
    },
    requests: {
      title: "My Builds",
      description: "Builds and collaboration requests belong together, so join requests are shown here.",
    },
    drafts: {
      title: "Drafts",
      description: "Continue unfinished ideas and retry pending or failed AI reviews.",
    },
    saved: {
      title: "Saved Ideas",
      description: "Your bookmarked ideas for later exploration and implementation.",
    },
  } as const;
  const activeSection = sectionMeta[tab];

  return (
    <main className="flex min-h-screen lg:h-screen w-full flex-col lg:flex-row gap-0 overflow-hidden bg-background">
      <AppSidebar
        active="dashboard"
        user={{
          id: user.id,
          email: user.email,
          name: myProfile?.name,
          username: myProfile?.username,
          profileImageUrl: myProfile?.profile_image_url,
        }}
      />

      <div className="min-w-0 flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-background lg:h-full hide-scrollbar">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold text-ink">
              Welcome back{myProfile?.name ? `, ${myProfile.name}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your ideas and builds.</p>
          </div>
          <Link href="/ideas/submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Submit an idea
          </Link>
        </header>

        <SummaryCards
          publishedCount={publishedCount}
          draftCount={draftCount}
          activeBuildCount={activeBuildCount}
          avgScore={avgScore}
        />

        <section className="rounded-xl border border-border/70 bg-card/70 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-heading text-xl text-ink">{activeSection.title}</h2>
              <p className="text-sm text-muted-foreground">{activeSection.description}</p>
            </div>
            <Badge variant="outline" className="rounded-md">
              {tab === "builds" ? `${receivedPendingCount} pending requests` : `View: ${activeSection.title}`}
            </Badge>
          </div>
          <div className="mt-4">
            <DashboardTabs active={tab} />
          </div>
        </section>

        {tab === "ideas" ? (
          <>
            <MyIdeasList ideas={myIdeas} />
            <QualityChart ideas={myIdeas} />
          </>
        ) : null}
        {tab === "builds" ? (
          <div className="space-y-6">
            <MyBuildsList
              builds={mergedBuilds.map((build) => {
                const idea = firstRelation(build.ideas);
                const lead = firstRelation(build.profiles);
                return {
                  ...build,
                  ideas: { title: idea?.title ?? null },
                  leadName: lead?.username ? `@${lead.username}` : (lead?.name ?? null),
                  leadProfileHref: lead?.username ? `/u/${lead.username}` : null,
                  commitCount: commitCountMap.get(build.github_repo_url) ?? null,
                };
              })}
            />
            <section id="join-requests" className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                <div>
                  <h2 className="font-heading text-xl text-ink">Requests to join your builds</h2>
                  <p className="text-sm text-muted-foreground">
                    Review people asking to join implementations you lead.
                  </p>
                </div>
                <ReceivedJoinRequestsList items={receivedRequests} />
              </div>
              <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                <div>
                  <h2 className="font-heading text-xl text-ink">Requests you sent</h2>
                  <p className="text-sm text-muted-foreground">
                    Track collaboration requests you sent to other build leads.
                  </p>
                </div>
                <SentJoinRequestsList items={sentRequests} />
              </div>
            </section>
          </div>
        ) : null}
        {tab === "drafts" ? <DraftsList drafts={drafts ?? []} /> : null}
        {tab === "saved" ? (
          <SavedIdeasList
            ideas={(savedIdeas ?? [])
              .map((row) =>
                firstRelation(
                  row.ideas as
                    | { id: string; title: string; quality_score: number | null }[]
                    | { id: string; title: string; quality_score: number | null }
                    | null,
                ),
              )
              .filter((idea): idea is { id: string; title: string; quality_score: number | null } =>
                Boolean(idea),
              )}
          />
        ) : null}
      </div>
    </main>
  );
}
  type BuildRow = {
    id: string;
    build_title: string | null;
    github_repo_url: string;
    deployed_url: string | null;
    status: "IN_PROGRESS" | "BUILT";
    target_completion_time: string | null;
    created_at: string;
    ideas: { title: string | null }[] | { title: string | null } | null;
    profiles:
      | { name: string | null; username: string | null; profile_image_url: string | null }[]
      | { name: string | null; username: string | null; profile_image_url: string | null }
      | null;
  };

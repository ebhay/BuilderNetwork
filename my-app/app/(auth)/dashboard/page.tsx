import { requireOnboarded, requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DashboardTabs } from "@/features/dashboard/components/dashboard-tabs";
import { MyIdeasList } from "@/features/dashboard/components/my-ideas-list";
import { MyBuildsList } from "@/features/dashboard/components/my-builds-list";
import { DraftsList } from "@/features/dashboard/components/drafts-list";
import { SavedIdeasList } from "@/features/dashboard/components/saved-ideas-list";
import { fetchIdeaStatsMap } from "@/lib/ideas/status";
import { ReceivedJoinRequestsList } from "@/features/join-requests/components/received-join-requests-list";
import { SentJoinRequestsList } from "@/features/join-requests/components/sent-join-requests-list";
import { AppSidebar } from "@/components/layout/app-sidebar";

type Props = {
  searchParams: Promise<{ tab?: "ideas" | "builds" | "requests" | "drafts" | "saved" }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const user = await requireUser("/dashboard");
  await requireOnboarded(user.id, "/dashboard");
  const { tab: searchTab } = await searchParams;
  const tab = searchTab ?? "ideas";
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
    .select("id,build_title,github_repo_url,deployed_url,status,target_completion_time,created_at,ideas(title)")
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
        .select("id,build_title,github_repo_url,deployed_url,status,target_completion_time,created_at,ideas(title)")
        .in("id", joinedBuildIds)
    : { data: [] as never[] };

  const buildMap = new Map<string, BuildRow>();
  for (const item of (myBuilds ?? []) as BuildRow[]) buildMap.set(item.id, item);
  for (const item of (joinedBuilds ?? []) as BuildRow[]) buildMap.set(item.id, item);
  const mergedBuilds = Array.from(buildMap.values()).sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const { data: drafts } = await supabase
    .from("ideas")
    .select("id,title,review_status,visibility")
    .eq("posted_by_user_id", user.id)
    .or("visibility.eq.DRAFT,review_status.eq.PENDING_REVIEW,review_status.eq.ERROR")
    .order("created_at", { ascending: false })
    .limit(40);

  const { data: savedIdeas } = await supabase
    .from("saved_ideas")
    .select("ideas!inner(id,title,quality_score)")
    .eq("user_id", user.id)
    .limit(40);

  const { data: receivedRaw } = await supabase
    .from("join_requests")
    .select("id,implementation_id,message,status,requester_user_id")
    .in(
      "implementation_id",
      (myBuilds ?? []).map((build) => build.id),
    )
    .limit(80);

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
      ideaTitle: (build?.ideas as { title: string | null }[])?.[0]?.title ?? "Idea",
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
      ideaTitle: (build?.ideas as { title: string | null }[])?.[0]?.title ?? "Idea",
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

  return (
    <main className="flex h-screen w-full gap-6 overflow-hidden pb-8">
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

      <div className="hide-scrollbar min-w-0 flex-1 space-y-6 overflow-y-auto px-6 pt-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-semibold text-ink">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your ideas and builds.</p>
          </div>
          <Link href="/ideas/submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Submit an idea
          </Link>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Ideas Published</p>
            <p className="mt-1 text-3xl font-semibold text-ink">{publishedCount}</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Active Builds</p>
            <p className="mt-1 text-3xl font-semibold text-ink">{activeBuildCount}</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Pending Requests</p>
            <p className="mt-1 text-3xl font-semibold text-ink">{receivedPendingCount}</p>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Average Idea Score</p>
            <p className="mt-1 text-3xl font-semibold text-ink">{avgScore}</p>
          </div>
        </section>

        <DashboardTabs active={tab} />

        {tab === "ideas" ? <MyIdeasList ideas={myIdeas} /> : null}
        {tab === "builds" ? (
          <MyBuildsList
            builds={mergedBuilds.map((build) => ({
              ...build,
              ideas: { title: build.ideas?.[0]?.title ?? null },
            }))}
          />
        ) : null}
        {tab === "requests" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-3">
              <h2 className="font-heading text-xl text-ink">Received</h2>
              <ReceivedJoinRequestsList items={receivedRequests} />
            </section>
            <section className="space-y-3">
              <h2 className="font-heading text-xl text-ink">Sent</h2>
              <SentJoinRequestsList items={sentRequests} />
            </section>
          </div>
        ) : null}
        {tab === "drafts" ? <DraftsList drafts={drafts ?? []} /> : null}
        {tab === "saved" ? (
          <SavedIdeasList
            ideas={(savedIdeas ?? []).map((row) => {
              const idea = (row.ideas as { id: string; title: string; quality_score: number | null }[])[0];
              return idea;
            }).filter(Boolean)}
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
    ideas: { title: string | null }[];
  };

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  LinkIcon,
  MessageSquare,
  Rocket,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ImplementationStatusBadge } from "@/features/implementations/components/implementation-status-badge";
import { getCurrentUser, getProfile } from "@/lib/auth/session";
import {
  markImplementationBuiltAction,
} from "@/features/implementations/actions";
import { respondJoinRequestAction } from "@/features/join-requests/actions";
import { JoinRequestForm } from "@/features/join-requests/components/join-request-form";
import { JoinRequestStatus } from "@/features/join-requests/components/join-request-status";
import { ImplementationMembersList } from "@/features/implementations/components/implementation-members-list";
import { LeadContactLinks } from "@/features/implementations/components/lead-contact-links";
import { LeadBuildControls } from "@/features/implementations/components/lead-build-controls";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { displayBuilderName, firstRelation } from "@/lib/supabase/relations";

import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

type ProfileRelation =
  | { id?: string | null; name: string | null; username?: string | null; profile_image_url?: string | null }
  | { id?: string | null; name: string | null; username?: string | null; profile_image_url?: string | null }[]
  | null;

type IdeaRelation =
  | {
      id: string;
      title: string | null;
      visibility: "PUBLISHED" | "NEEDS_REFINEMENT";
      posted_by_user_id: string;
      profiles?: ProfileRelation;
    }
  | {
      id: string;
      title: string | null;
      visibility: "PUBLISHED" | "NEEDS_REFINEMENT";
      posted_by_user_id: string;
      profiles?: ProfileRelation;
    }[]
  | null;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!isSupabaseConfigured()) return { title: "Implementation | Builder Network" };

  const supabase = await createSupabaseServerClient();
  const { data: implementation } = await supabase
    .from("implementations")
    .select("build_title,ideas(title)")
    .eq("id", id)
    .maybeSingle();

  if (!implementation) return { title: "Implementation Not Found | Builder Network" };

  const idea = firstRelation(implementation.ideas as { title: string | null }[] | { title: string | null } | null);
  const buildTitle = implementation.build_title || idea?.title || "Implementation";
  return {
    title: `${buildTitle} | Builder Network`,
    description: "View the repository, team, collaboration status, and launch details for this build.",
  };
}

export default async function ImplementationDetailPage({ params }: Props) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10 text-muted-foreground">
        Configure Supabase environment values to view implementation details.
      </main>
    );
  }

  const { id } = await params;
  const user = await getCurrentUser();
  const viewerProfile = user ? await getProfile(user.id) : null;
  const supabase = await createSupabaseServerClient();
  const { data: implementation } = await supabase
    .from("implementations")
    .select(
      "id,idea_id,lead_user_id,build_title,build_note,needed_roles,github_repo_url,deployed_url,target_completion_time,credit_to_idea_giver,credit_note,status,created_at,ideas!inner(id,title,visibility,posted_by_user_id,profiles:posted_by_user_id(id,name,username,profile_image_url)),profiles:lead_user_id(id,name,username,profile_image_url)",
    )
    .eq("id", id)
    .in("ideas.visibility", ["PUBLISHED", "NEEDS_REFINEMENT"])
    .maybeSingle();

  if (!implementation) notFound();

  const { data: members } = await supabase
    .from("implementation_members_public")
    .select("user_id,name,username,profile_image_url,coding_level,role,role_focus")
    .eq("implementation_id", implementation.id);

  const canMarkBuilt = user?.id === implementation.lead_user_id;
  const isLead = user?.id === implementation.lead_user_id;
  const isMember = !!user && (members ?? []).some((member) => member.user_id === user.id);

  const { data: requesterPending } = user
    ? await supabase
        .from("join_requests")
        .select("id,status")
        .eq("implementation_id", implementation.id)
        .eq("requester_user_id", user.id)
        .eq("status", "PENDING")
        .maybeSingle()
    : { data: null };

  const { data: leadContactLinks } = await supabase
    .from("social_links")
    .select("type,url")
    .eq("user_id", implementation.lead_user_id)
    .eq("is_public", true);

  const { data: pendingJoinRequestsRaw } = isLead
    ? await supabase
        .from("join_requests")
        .select("id,requester_user_id,message,status")
        .eq("implementation_id", implementation.id)
        .eq("status", "PENDING")
        .order("created_at", { ascending: true })
    : { data: [] as never[] };

  const requesterIds = Array.from(new Set((pendingJoinRequestsRaw ?? []).map((row) => row.requester_user_id)));
  const { data: pendingRequesterProfiles } = requesterIds.length
    ? await supabase.from("profiles").select("id,name,username,coding_level").in("id", requesterIds)
    : { data: [] as never[] };
  const requesterMap = new Map((pendingRequesterProfiles ?? []).map((item) => [item.id, item]));
  const pendingJoinRequests = (pendingJoinRequestsRaw ?? []).map((row) => ({
    id: row.id,
    status: row.status,
    message: row.message,
    requester: requesterMap.get(row.requester_user_id) ?? null,
  }));

  const joinState = !user
    ? "LOGIN_REQUIRED"
    : isLead
      ? "LEAD"
      : isMember
        ? "MEMBER"
        : requesterPending
          ? "PENDING"
          : "NONE";

  const leadProfile = firstRelation(implementation.profiles as ProfileRelation);
  const parentIdea = firstRelation(implementation.ideas as IdeaRelation);
  const ideaAuthor = firstRelation(parentIdea?.profiles ?? null);
  const teamMembers = (() => {
    const base = (members ?? []) as Array<{
      user_id: string;
      name: string | null;
      username?: string | null;
      profile_image_url: string | null;
      coding_level: string | null;
      role: "LEAD" | "TEAMMATE";
      role_focus?: string | null;
    }>;
    const leadIdx = base.findIndex((member) => member.user_id === implementation.lead_user_id);
    if (leadIdx >= 0 && leadProfile) {
      const copy = [...base];
      copy[leadIdx] = {
        ...copy[leadIdx],
        name: copy[leadIdx].name ?? leadProfile.name ?? "Builder",
        username: copy[leadIdx].username ?? leadProfile.username ?? null,
        profile_image_url: copy[leadIdx].profile_image_url ?? leadProfile.profile_image_url ?? null,
      };
      return copy;
    }
    if (leadProfile) {
      return [
        {
          user_id: implementation.lead_user_id,
          name: leadProfile.name ?? "Builder",
          username: leadProfile.username ?? null,
          profile_image_url: leadProfile.profile_image_url ?? null,
          coding_level: null,
          role: "LEAD" as const,
          role_focus: null,
        },
        ...base,
      ];
    }
    return base;
  })();
  const buildTitle = implementation.build_title || parentIdea?.title || "Untitled build";
  const memberCount = teamMembers.length;
  const createdDate = new Date(implementation.created_at).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="flex min-h-screen w-full flex-col gap-0 overflow-hidden bg-background lg:h-screen lg:flex-row">
      <AppSidebar
        active="ideas"
        user={
          user
            ? {
                id: user.id,
                email: user.email,
                name: viewerProfile?.name,
                username: viewerProfile?.username,
                profileImageUrl: viewerProfile?.profile_image_url,
              }
            : null
        }
      />

      <div className="min-w-0 flex-1 overflow-y-auto bg-background px-4 py-6 md:px-8 lg:h-full">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <Link
            href={implementation.idea_id ? `/ideas/${implementation.idea_id}` : "/ideas"}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to parent idea
          </Link>

          <section className="overflow-hidden rounded-2xl border border-border bg-brand-navy text-on-dark shadow-mockup">
            <div className="relative grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
              <div className="relative space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <ImplementationStatusBadge status={implementation.status} tone="dark" />
                  <Badge className="rounded-md bg-white/10 text-on-dark ring-1 ring-white/15">
                    <Users className="mr-1 h-3.5 w-3.5" />
                    {memberCount} {memberCount === 1 ? "builder" : "builders"}
                  </Badge>
                  {implementation.deployed_url ? (
                    <Badge className="rounded-md bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-300/20">
                      Live
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-on-dark-muted">Implementation of {parentIdea?.title ?? "a public idea"}</p>
                  <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                    {buildTitle}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-on-dark-muted md:text-base">
                    Led by <span className="font-medium text-on-dark">{displayBuilderName(leadProfile, "Builder")}</span>.
                    {" "}Original idea by <span className="font-medium text-on-dark">{displayBuilderName(ideaAuthor, "Builder")}</span>.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={implementation.github_repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ variant: "default", className: "gap-2" })}
                  >
                    <GitBranch className="h-4 w-4" />
                    Open repository
                  </a>
                  {implementation.deployed_url ? (
                    <a
                      href={implementation.deployed_url}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({
                        variant: "outline",
                        className: "gap-2 border-on-dark-muted bg-transparent text-on-dark hover:bg-white/10",
                      })}
                    >
                      <Rocket className="h-4 w-4" />
                      View live build
                    </a>
                  ) : null}
                  <Link
                    href={`/ideas/${implementation.idea_id}`}
                    className={buttonVariants({
                      variant: "outline",
                      className: "gap-2 border-on-dark-muted bg-transparent text-on-dark hover:bg-white/10 hover:text-on-dark hover:border-white/40",
                    })}
                  >
                    <LinkIcon className="h-4 w-4" />
                    Parent idea
                  </Link>
                </div>
              </div>

              <div className="relative rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-dark-muted">Build status</span>
                    <span className="text-sm font-medium text-on-dark">
                      {implementation.status === "BUILT" ? "Shipped" : "In progress"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-dark-muted">Started</span>
                    <span className="text-sm font-medium text-on-dark">{createdDate}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-dark-muted">Target</span>
                    <span className="text-sm font-medium text-on-dark">{implementation.target_completion_time || "Not set"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <Card className="border border-border bg-card/90 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 font-heading text-xl">
                    <GitBranch className="h-5 w-5 text-primary" />
                    Build overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {!isLead ? (
                    implementation.build_note ? (
                      <p className="rounded-lg border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">
                        {implementation.build_note}
                      </p>
                    ) : (
                      <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                        The build lead has not added a build note yet.
                      </p>
                    )
                  ) : null}

                  {isLead ? (
                    <LeadBuildControls
                      implementationId={implementation.id}
                      buildNote={implementation.build_note ?? ""}
                      neededRoles={Array.isArray(implementation.needed_roles) ? implementation.needed_roles : []}
                      targetCompletionTime={implementation.target_completion_time ?? ""}
                    />
                  ) : null}

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <CalendarDays className="mb-2 h-4 w-4 text-primary" />
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="mt-1 text-sm font-medium text-ink">{createdDate}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <Target className="mb-2 h-4 w-4 text-primary" />
                      <p className="text-xs text-muted-foreground">Target</p>
                      <p className="mt-1 text-sm font-medium text-ink">{implementation.target_completion_time || "Not set"}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <CheckCircle2 className="mb-2 h-4 w-4 text-primary" />
                      <p className="text-xs text-muted-foreground">Credit</p>
                      <p className="mt-1 text-sm font-medium text-ink">
                        {implementation.credit_to_idea_giver ? "Idea credited" : "Custom credit"}
                      </p>
                    </div>
                  </div>

                  {implementation.credit_note ? (
                    <div className="rounded-lg bg-accent p-4 text-sm text-accent-foreground">
                      <span className="font-medium">Credit note:</span> {implementation.credit_note}
                    </div>
                  ) : null}

                  {Array.isArray(implementation.needed_roles) && implementation.needed_roles.length > 0 ? (
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Open roles</p>
                      <div className="flex flex-wrap gap-2">
                        {implementation.needed_roles.map((role) => (
                          <Badge key={role} variant="outline" className="rounded-md">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <ImplementationMembersList
                members={teamMembers as never[]}
                isLead={isLead}
                implementationId={implementation.id}
              />
            </div>

            <aside className="space-y-6">
              <Card className="border border-border bg-card/90 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-xl">Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Repository</p>
                    <a
                      href={implementation.github_repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({ variant: "outline", className: "w-full justify-between gap-2" })}
                    >
                      <span className="inline-flex items-center gap-2">
                        <GitBranch className="h-4 w-4" />
                        Open repository
                      </span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Live build</p>
                    {implementation.deployed_url ? (
                      <a
                        href={implementation.deployed_url}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonVariants({ variant: "default", className: "w-full justify-between gap-2" })}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Rocket className="h-4 w-4" />
                          Open deployed app
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <div className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                        No deployed link yet.
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Parent idea</p>
                    <Link
                      href={`/ideas/${implementation.idea_id}`}
                      className={buttonVariants({ variant: "outline", className: "w-full justify-between gap-2" })}
                    >
                      <span className="inline-flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        View parent idea
                      </span>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card/90 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-heading text-xl">Invite members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Share this implementation link so builders can request joining. Open roles help people self-select.
                  </p>
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground break-all">
                    {`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/implementations/${implementation.id}`}
                  </div>
                  {Array.isArray(implementation.needed_roles) && implementation.needed_roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {implementation.needed_roles.map((role) => (
                        <Badge key={`invite-${role}`} variant="outline" className="rounded-md">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No open roles listed yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-border bg-card/90 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 font-heading text-xl">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Collaborate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <JoinRequestStatus state={joinState} />
                  {joinState === "LOGIN_REQUIRED" ? (
                    <Link
                      href={`/login?next=${encodeURIComponent(`/implementations/${implementation.id}`)}`}
                      className={buttonVariants({ variant: "default" })}
                    >
                      Log in to request joining
                    </Link>
                  ) : null}
                  {joinState === "NONE" ? <JoinRequestForm implementationId={implementation.id} /> : null}
                  {joinState === "LEAD" ? (
                    <p className="text-sm text-muted-foreground">You lead this build. Manage join requests from My Builds.</p>
                  ) : null}
                  {joinState === "MEMBER" ? (
                    <p className="text-sm text-muted-foreground">You are already part of this implementation.</p>
                  ) : null}
                </CardContent>
              </Card>

              {isLead ? (
                <Card className="border border-border bg-card/90 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-xl">Pending join requests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingJoinRequests.length === 0 ? (
                      <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                        No pending requests yet.
                      </p>
                    ) : (
                      pendingJoinRequests.map((item) => (
                        <div key={item.id} className="space-y-2 rounded-md border border-border bg-background p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-ink">
                                {item.requester?.name ?? "Builder"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.requester?.username ? `@${item.requester.username}` : "No username"}{" "}
                                {item.requester?.coding_level ? `· ${item.requester.coding_level}` : ""}
                              </p>
                            </div>
                            <Link
                              href={`/u/${item.requester?.username ?? item.requester?.id ?? ""}`}
                              className={buttonVariants({ variant: "outline", className: "h-8 px-3 text-xs rounded-md" })}
                            >
                              View profile
                            </Link>
                          </div>
                          {item.message ? <p className="text-sm text-muted-foreground">{item.message}</p> : null}
                          <div className="flex gap-2">
                            <form action={respondJoinRequestAction}>
                              <input type="hidden" name="joinRequestId" value={item.id} />
                              <input type="hidden" name="decision" value="ACCEPT" />
                              <button type="submit" className={buttonVariants({ variant: "default", className: "h-8 px-3 text-xs rounded-md" })}>
                                Accept
                              </button>
                            </form>
                            <form action={respondJoinRequestAction}>
                              <input type="hidden" name="joinRequestId" value={item.id} />
                              <input type="hidden" name="decision" value="REJECT" />
                              <button type="submit" className={buttonVariants({ variant: "outline", className: "h-8 px-3 text-xs rounded-md" })}>
                                Reject
                              </button>
                            </form>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              ) : null}

              <LeadContactLinks
                leadName={displayBuilderName(leadProfile, "Build lead")}
                links={(leadContactLinks ?? []).map((link) => ({ type: link.type, url: link.url }))}
              />

              {canMarkBuilt && implementation.status !== "BUILT" ? (
                <Card className="border border-border bg-card/90 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-xl">Mark as built</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form action={markImplementationBuiltAction} className="space-y-3">
                      <input type="hidden" name="implementationId" value={implementation.id} />
                      <input
                        type="url"
                        name="deployedUrl"
                        required
                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                        placeholder="https://your-deployed-app.com"
                      />
                      <button className={buttonVariants({ variant: "default", className: "w-full gap-2" })} type="submit">
                        <Rocket className="h-4 w-4" />
                        Save deployed URL
                      </button>
                    </form>
                  </CardContent>
                </Card>
              ) : null}
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}


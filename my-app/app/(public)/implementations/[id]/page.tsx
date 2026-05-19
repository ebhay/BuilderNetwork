import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ImplementationStatusBadge } from "@/features/implementations/components/implementation-status-badge";
import { getCurrentUser } from "@/lib/auth/session";
import { markImplementationBuiltAction } from "@/features/implementations/actions";
import { JoinRequestForm } from "@/features/join-requests/components/join-request-form";
import { JoinRequestStatus } from "@/features/join-requests/components/join-request-status";
import { ImplementationMembersList } from "@/features/implementations/components/implementation-members-list";
import { LeadContactLinks } from "@/features/implementations/components/lead-contact-links";

import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

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

  const buildTitle = implementation.build_title || (implementation.ideas as { title: string | null }[])?.[0]?.title || "Implementation";
  return {
    title: `${buildTitle} | Builder Network`,
    description: `View details for the implementation of this idea on Builder Network.`,
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
  const supabase = await createSupabaseServerClient();
  const { data: implementation } = await supabase
    .from("implementations")
    .select(
      "id,idea_id,lead_user_id,build_title,build_note,github_repo_url,deployed_url,target_completion_time,credit_to_idea_giver,credit_note,status,created_at,ideas!inner(id,title,visibility,posted_by_user_id,profiles:posted_by_user_id(name)),profiles:lead_user_id(name)",
    )
    .eq("id", id)
    .in("ideas.visibility", ["PUBLISHED", "NEEDS_REFINEMENT"])
    .maybeSingle();

  if (!implementation) notFound();

  const { data: members } = await supabase
    .from("implementation_members_public")
    .select("user_id,name,profile_image_url,coding_level,role")
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

  const joinState = !user
    ? "LOGIN_REQUIRED"
    : isLead
      ? "LEAD"
      : isMember
        ? "MEMBER"
        : requesterPending
          ? "PENDING"
          : "NONE";

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <ImplementationStatusBadge status={implementation.status} />
          <Badge variant="outline" className="rounded-md">
            Lead: {(implementation.profiles as { name: string | null }[])?.[0]?.name ?? "Unknown"}
          </Badge>
        </div>
        <h1 className="font-heading text-3xl font-semibold text-ink">
          {implementation.build_title || (implementation.ideas as { title: string | null }[])?.[0]?.title}
        </h1>
        <p className="text-muted-foreground">
          Idea by{" "}
          {(implementation.ideas as { profiles: { name: string | null }[] }[])?.[0]?.profiles?.[0]?.name ??
            "Unknown builder"}
        </p>
      </header>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Implementation details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <a href={implementation.github_repo_url} target="_blank" rel="noreferrer" className="underline">
            {implementation.github_repo_url}
          </a>
          {implementation.deployed_url ? (
            <a href={implementation.deployed_url} target="_blank" rel="noreferrer" className="block underline">
              {implementation.deployed_url}
            </a>
          ) : null}
          {implementation.build_note ? <p>{implementation.build_note}</p> : null}
          {implementation.target_completion_time ? (
            <p>Target completion: {implementation.target_completion_time}</p>
          ) : null}
          {implementation.credit_note ? <p>Credit note: {implementation.credit_note}</p> : null}
          <p>Created: {new Date(implementation.created_at).toLocaleDateString()}</p>
          <Link href={`/ideas/${implementation.idea_id}`} className={buttonVariants({ variant: "outline" })}>
            View parent idea
          </Link>
        </CardContent>
      </Card>

      <ImplementationMembersList members={(members ?? []) as never[]} />
      <LeadContactLinks
        leadName={(implementation.profiles as { name: string | null }[])?.[0]?.name ?? "Unknown lead"}
        links={(leadContactLinks ?? []).map((link) => ({ type: link.type, url: link.url }))}
      />

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Collaborate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>

      {canMarkBuilt && implementation.status !== "BUILT" ? (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="font-heading text-xl">Mark as built</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={markImplementationBuiltAction} className="flex flex-col gap-3 md:flex-row">
              <input type="hidden" name="implementationId" value={implementation.id} />
              <input
                type="url"
                name="deployedUrl"
                required
                className="h-8 rounded-lg border border-input px-3"
                placeholder="https://your-deployed-app.com"
              />
              <button className={buttonVariants({ variant: "default" })} type="submit">
                Save deployed URL and mark built
              </button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

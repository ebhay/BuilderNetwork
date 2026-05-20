import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser, getProfile } from "@/lib/auth/session";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CalendarDays, ExternalLink, Globe, MapPin } from "lucide-react";
import Image from "next/image";

import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: "ideas" | "builds" | "building" | "built" | "saved" }>;
};

const UUID_LIKE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function SocialIcon({ type }: { type: string }) {
  if (type === "GITHUB") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.23 1.84 1.23 1.07 1.84 2.81 1.3 3.49 1 .11-.78.42-1.3.77-1.6-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.31-.54-1.56.12-3.24 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.68.24 2.93.12 3.24.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.82 1.11.82 2.24v3.32c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
      </svg>
    );
  }
  if (type === "LINKEDIN") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.33 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.11 20.45H3.55V9h3.56v11.45Z" />
      </svg>
    );
  }
  if (type === "TWITTER") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    );
  }
  return <Globe className="h-4 w-4" />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: slug } = await params;
  if (!isSupabaseConfigured()) return { title: "Profile | Builder Network" };

  const supabase = await createSupabaseServerClient();
  const baseQuery = supabase.from("profiles").select("id,name,bio");
  const { data: profileBase } = UUID_LIKE.test(slug)
    ? await baseQuery.eq("id", slug).maybeSingle()
    : await baseQuery.eq("username", slug).maybeSingle();
  if (!profileBase) return { title: "Profile Not Found | Builder Network" };
  const { data: profileExtra } = await supabase
    .from("profiles")
    .select("headline")
    .eq("id", profileBase.id)
    .maybeSingle();

  return {
    title: `${profileBase.name} | Builder Network`,
    description:
      (profileExtra?.headline || profileBase.bio)?.slice(0, 160) || `Check out ${profileBase.name}'s builder profile.`,
  };
}

export default async function PublicProfilePage({ params, searchParams }: Props) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10 text-muted-foreground">
        Configure Supabase environment values to view profiles.
      </main>
    );
  }

  const { id: slug } = await params;
  const { tab: searchTab } = await searchParams;
  const viewer = await getCurrentUser();
  const viewerProfile = viewer ? await getProfile(viewer.id) : null;
  const tab = searchTab === "building" || searchTab === "built" ? "builds" : (searchTab ?? "ideas");
  const supabase = await createSupabaseServerClient();

  const profileQuery = supabase
    .from("profiles")
    .select("id,name,username,bio,coding_level,profile_image_url,created_at");
  const { data: profileBase } = UUID_LIKE.test(slug)
    ? await profileQuery.eq("id", slug).maybeSingle()
    : await profileQuery.eq("username", slug).maybeSingle();
  if (!profileBase) notFound();
  const { data: profileExtra } = await supabase
    .from("profiles")
    .select("headline,location")
    .eq("id", profileBase.id)
    .maybeSingle();
  const profile = { ...profileBase, headline: profileExtra?.headline ?? null, location: profileExtra?.location ?? null };
  const isSelf = viewer?.id === profileBase.id;
  const profileSlug = profileBase.username || profileBase.id;

  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("type,url")
    .eq("user_id", profileBase.id)
    .eq("is_public", true);

  const { data: ideas } = await supabase
    .from("ideas")
    .select("id,title,quality_score,visibility,created_at")
    .eq("posted_by_user_id", profileBase.id)
    .in("visibility", ["PUBLISHED", "NEEDS_REFINEMENT"])
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: building } = await supabase
    .from("implementations")
    .select("id,build_title,github_repo_url,deployed_url,status,target_completion_time,created_at,ideas(title)")
    .eq("lead_user_id", profileBase.id)
    .eq("status", "IN_PROGRESS")
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: built } = await supabase
    .from("implementations")
    .select("id,build_title,github_repo_url,deployed_url,status,target_completion_time,created_at,ideas(title)")
    .eq("lead_user_id", profileBase.id)
    .eq("status", "BUILT")
    .order("created_at", { ascending: false })
    .limit(30);
  const mergedBuilds = [...(building ?? []), ...(built ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const { data: saved } = isSelf
    ? await supabase
        .from("saved_ideas")
        .select("ideas!inner(id,title,quality_score)")
        .eq("user_id", profileBase.id)
        .limit(30)
    : { data: [] as Array<{ ideas: { id: string; title: string; quality_score: number | null } }> };

  const { data: skillRows } = await supabase
    .from("skills")
    .select("name")
    .eq("user_id", profileBase.id)
    .limit(40);

  const { data: memberRows } = await supabase
    .from("implementation_members_public")
    .select("user_id,implementation_id")
    .in("implementation_id", [...(building ?? []).map((b) => b.id), ...(built ?? []).map((b) => b.id)]);

  const ideaCount = (ideas ?? []).length;
  const activeBuildCount = (building ?? []).length;
  const collaboratorSet = new Set((memberRows ?? []).map((row) => row.user_id));
  collaboratorSet.delete(profileBase.id);
  const collaboratorCount = collaboratorSet.size;
  const aboutItems = [
    profile.headline || null,
    profile.location || null,
    isSelf && viewer?.email ? viewer.email : null,
  ].filter(Boolean) as string[];

  return (
    <main className="flex h-screen w-full gap-6 overflow-hidden">
      {viewer ? (
        <AppSidebar
          active="my-profile"
          user={{
            id: viewer.id,
            email: viewer.email,
            name: viewerProfile?.name,
            username: viewerProfile?.username,
            profileImageUrl: viewerProfile?.profile_image_url,
          }}
        />
      ) : null}

      <section className="hide-scrollbar mx-auto min-w-0 w-full max-w-7xl space-y-4 overflow-y-auto px-6 pt-6">
        <header className="rounded-xl bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border bg-muted">
                {profile.profile_image_url ? (
                  <Image src={profile.profile_image_url} alt={profile.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl font-semibold text-primary">
                    {profile.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="absolute -right-0.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div className="space-y-2">
                <h1 className="font-heading text-4xl font-semibold text-ink">{profile.name}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-md">{profile.coding_level}</Badge>
                  {profile.location ? (
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {profile.location}
                    </span>
                  ) : null}
                </div>
                <p className="max-w-3xl text-sm text-muted-foreground">{profile.headline || "No headline added yet."}</p>
                {profile.bio ? <p className="max-w-3xl text-sm text-muted-foreground">{profile.bio}</p> : null}
                <div className="flex flex-wrap gap-2">
                  {(socialLinks ?? []).map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({ variant: "outline", className: "h-9 w-9 p-0" })}
                      aria-label={link.type}
                      title={link.type}
                    >
                      <SocialIcon type={link.type} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSelf ? (
                <Link href="/onboarding?edit=1&next=%2Fdashboard" className={buttonVariants({ variant: "default" })}>
                  Edit Profile
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <section className="grid gap-3 rounded-xl bg-card p-0 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Ideas Published</p>
                <p className="mt-1 text-3xl font-semibold">{ideaCount}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Active Builds</p>
                <p className="mt-1 text-3xl font-semibold">{activeBuildCount}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Collaborators</p>
                <p className="mt-1 text-3xl font-semibold">{collaboratorCount}</p>
              </div>
            </section>

            <nav className="flex flex-wrap gap-2">
          <Link href={`/u/${profileSlug}?tab=ideas`} className={buttonVariants({ variant: tab === "ideas" ? "default" : "outline" })}>
            Ideas
          </Link>
          <Link href={`/u/${profileSlug}?tab=builds`} className={buttonVariants({ variant: tab === "builds" ? "default" : "outline" })}>
            Builds
          </Link>
          {isSelf ? (
            <Link href={`/u/${profileSlug}?tab=saved`} className={buttonVariants({ variant: tab === "saved" ? "default" : "outline" })}>
              Saved
            </Link>
              ) : null}
            </nav>

            {tab === "builds" ? (
              <div className="grid gap-3 md:grid-cols-2">
                {mergedBuilds.map((item) => (
                  <Card key={item.id} className="border border-border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="space-y-3">
                          <h3 className="font-heading text-lg">
                            {item.build_title || (item.ideas as { title: string | null }[])?.[0]?.title || "Untitled build"}
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary">{item.status === "BUILT" ? "Completed" : "In progress"}</Badge>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium">Repository</p>
                          <a href={item.github_repo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                            Open repo <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <Link href={`/implementations/${item.id}`} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                            View details
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}

            {tab === "ideas" ? (
              <div className="grid gap-3 md:grid-cols-2">
                {(ideas ?? []).map((idea) => (
                  <Card key={idea.id} className="border border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-heading text-lg">{idea.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <p>{idea.visibility} {idea.quality_score ? `· Score ${idea.quality_score.toFixed(1)}` : ""}</p>
                      <Link href={`/ideas/${idea.id}`} className={buttonVariants({ variant: "outline" })}>
                        View idea
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}

            {tab === "saved" && isSelf ? (
              <div className="grid gap-3">
                {(saved ?? []).map((row) => (
                  <Card
                    key={(row.ideas as { id: string; title: string; quality_score: number | null }[])[0].id}
                    className="border border-border"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="font-heading text-lg">
                        {(row.ideas as { id: string; title: string; quality_score: number | null }[])[0].title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <p>
                        {(row.ideas as { id: string; title: string; quality_score: number | null }[])[0].quality_score
                          ? `Score ${(row.ideas as { id: string; title: string; quality_score: number | null }[])[0].quality_score?.toFixed(1)}`
                          : "No score yet"}
                      </p>
                      <Link
                        href={`/ideas/${(row.ideas as { id: string; title: string; quality_score: number | null }[])[0].id}`}
                        className={buttonVariants({ variant: "outline" })}
                      >
                        View idea
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}
          </div>
          <aside className="space-y-3">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {aboutItems.length ? (
                  aboutItems.map((item, idx) => (
                    <p key={idx} className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {item}</p>
                  ))
                ) : (
                  <p>No details added yet.</p>
                )}
                <p className="inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" /> Joined 2024</p>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {(skillRows ?? []).slice(0, 14).map((skill) => (
                  <Badge key={skill.name} variant="secondary">{skill.name}</Badge>
                ))}
              </CardContent>
            </Card>

          </aside>
        </div>
      </section>
    </main>
  );
}

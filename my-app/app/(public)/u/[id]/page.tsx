import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/auth/session";
import { ImplementationCard } from "@/features/implementations/components/implementation-card";

import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: "ideas" | "building" | "built" | "saved" }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: slug } = await params;
  if (!isSupabaseConfigured()) return { title: "Profile | Builder Network" };
  
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name,bio")
    .or(`id.eq.${slug},username.eq.${slug}`)
    .maybeSingle();

  if (!profile) return { title: "Profile Not Found | Builder Network" };

  return {
    title: `${profile.name} | Builder Network`,
    description: profile.bio?.slice(0, 160) || `Check out ${profile.name}'s builder profile.`,
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
  const tab = searchTab ?? "ideas";
  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,name,username,bio,coding_level,profile_image_url")
    .or(`id.eq.${slug},username.eq.${slug}`)
    .maybeSingle();
  if (!profile) notFound();
  const isSelf = viewer?.id === profile.id;
  const profileSlug = profile.username || profile.id;

  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("type,url")
    .eq("user_id", profile.id)
    .eq("is_public", true);

  const { data: ideas } = await supabase
    .from("ideas")
    .select("id,title,quality_score,visibility,created_at")
    .eq("posted_by_user_id", profile.id)
    .in("visibility", ["PUBLISHED", "NEEDS_REFINEMENT"])
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: building } = await supabase
    .from("implementations")
    .select("id,build_title,github_repo_url,deployed_url,status,target_completion_time,created_at,ideas(title)")
    .eq("lead_user_id", profile.id)
    .eq("status", "IN_PROGRESS")
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: built } = await supabase
    .from("implementations")
    .select("id,build_title,github_repo_url,deployed_url,status,target_completion_time,created_at,ideas(title)")
    .eq("lead_user_id", profile.id)
    .eq("status", "BUILT")
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: saved } = isSelf
    ? await supabase
        .from("saved_ideas")
        .select("ideas!inner(id,title,quality_score)")
        .eq("user_id", profile.id)
        .limit(30)
    : { data: [] as Array<{ ideas: { id: string; title: string; quality_score: number | null } }> };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <header className="space-y-3">
        <h1 className="font-heading text-3xl font-semibold text-ink">{profile.name}</h1>
        <p className="text-muted-foreground">{profile.bio ?? "No bio added yet."}</p>
        <Badge variant="outline" className="rounded-md">{profile.coding_level}</Badge>
        <div className="flex flex-wrap gap-2">
          {(socialLinks ?? []).map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              {link.type}
            </a>
          ))}
        </div>
      </header>

      <nav className="flex flex-wrap gap-2">
        <Link href={`/u/${profileSlug}?tab=ideas`} className={buttonVariants({ variant: tab === "ideas" ? "default" : "outline" })}>
          Ideas
        </Link>
        <Link href={`/u/${profileSlug}?tab=building`} className={buttonVariants({ variant: tab === "building" ? "default" : "outline" })}>
          Building
        </Link>
        <Link href={`/u/${profileSlug}?tab=built`} className={buttonVariants({ variant: tab === "built" ? "default" : "outline" })}>
          Built
        </Link>
        {isSelf ? (
          <Link href={`/u/${profileSlug}?tab=saved`} className={buttonVariants({ variant: tab === "saved" ? "default" : "outline" })}>
            Saved
          </Link>
        ) : null}
      </nav>

      {tab === "ideas" ? (
        <div className="grid gap-3">
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

      {tab === "building" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {(building ?? []).map((item) => (
            <ImplementationCard
              key={item.id}
              implementation={item as never}
              ideaTitle={(item.ideas as { title: string | null }[])?.[0]?.title ?? "Idea"}
            />
          ))}
        </div>
      ) : null}

      {tab === "built" ? (
        <div className="grid gap-3 md:grid-cols-2">
          {(built ?? []).map((item) => (
            <ImplementationCard
              key={item.id}
              implementation={item as never}
              ideaTitle={(item.ideas as { title: string | null }[])?.[0]?.title ?? "Idea"}
            />
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
    </main>
  );
}

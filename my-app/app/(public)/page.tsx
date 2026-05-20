import Link from "next/link";
import { Sparkles, ArrowRight, ExternalLink, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchIdeaStatsMap } from "@/lib/ideas/status";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { WorkspaceMockupCard } from "@/components/workspace-mockup";
import { ProblemSection } from "@/components/problem-section";
import { PipelineSection } from "@/components/pipeline-section";
import { AIReviewSection } from "@/components/ai-review-section";
import { MultiBuilderSection } from "@/components/multi-builder-section";
import { TechStackLogos } from "@/components/tech-stack-logos";
import { FAQSection } from "@/components/faq-section";
import { FinalCTA } from "@/components/final-cta";
import { Footer } from "@/components/layout/footer";

import type { Metadata } from "next";

interface IdeaProfile {
  name: string | null;
  username: string | null;
}

interface IdeaWithProfile {
  id: string;
  title: string;
  description: string;
  quality_score: number | null;
  project_level: string | null;
  tags: string[];
  required_skills: string[];
  created_at?: string;
  profiles: IdeaProfile | null;
  implementationCount?: number;
  builtCount?: number;
  derivedStatus?: "IDEA" | "IN_PROGRESS" | "BUILT";
}

interface ImplementationWithProfiles {
  id: string;
  build_title: string | null;
  deployed_url: string | null;
  github_repo_url: string;
  ideas: {
    title: string;
    profiles: IdeaProfile | null;
  } | null;
  profiles: IdeaProfile | null;
}

export const metadata: Metadata = {
  title: "Builder Network | Ship real projects",
  description:
    "Discover high-signal project ideas, get structured AI review, and publish execution-ready concepts for builders.",
};

// Rich mock data for development fallbacks
const mockFeaturedIdeas: IdeaWithProfile[] = [
  {
    id: "mock-1",
    title: "AI-Powered Micro-SaaS Accelerator",
    description: "A lightweight pipeline helper that listens to repository push events and automatically runs developer lint tests, compiles builds, and notifies Slack/Discord.",
    quality_score: 8.8,
    project_level: "INTERMEDIATE",
    tags: ["Developer Tools", "AI Pipeline", "Automation"],
    required_skills: ["Next.js", "AI APIs", "GitHub Webhooks"],
    profiles: { name: "Max Chen", username: "creator_max" },
    implementationCount: 2,
    builtCount: 1,
    derivedStatus: "IN_PROGRESS" as const,
  },
  {
    id: "mock-2",
    title: "Collaborative Realtime Wireframer",
    description: "Multiplayer web canvas for designers and developers to sketch mockups live. Features vector tools, quick export, and integrated component code extraction.",
    quality_score: 8.4,
    project_level: "EXPERT",
    tags: ["Design Tools", "Realtime", "Graphics"],
    required_skills: ["React", "WebSockets", "Canvas API"],
    profiles: { name: "Sarah Jenkins", username: "sarah_j" },
    implementationCount: 1,
    builtCount: 0,
    derivedStatus: "IN_PROGRESS" as const,
  },
  {
    id: "mock-3",
    title: "Offline-First Personal Wiki",
    description: "Local-first markdown editor that syncs with SQLite and indexes documents offline. Designed for speed, security, and developer note-taking.",
    quality_score: 7.9,
    project_level: "BEGINNER",
    tags: ["Productivity", "Markdown", "Local-First"],
    required_skills: ["React", "SQLite", "Tailwind CSS"],
    profiles: { name: "Alex Rover", username: "alex_r" },
    implementationCount: 0,
    builtCount: 0,
    derivedStatus: "IDEA" as const,
  }
];

const mockBuiltProjects: ImplementationWithProfiles[] = [
  {
    id: "build-mock-1",
    build_title: "Next.js Complete Accel",
    deployed_url: "https://vercel.com",
    github_repo_url: "https://github.com",
    ideas: {
      title: "AI-Powered Micro-SaaS Accelerator",
      profiles: { name: "Max Chen", username: "creator_max" }
    },
    profiles: { name: "Julia Vance", username: "julia_codes" }
  },
  {
    id: "build-mock-2",
    build_title: "Simple Markdown Sync",
    deployed_url: "https://netlify.app",
    github_repo_url: "https://github.com",
    ideas: {
      title: "Offline-First Personal Wiki",
      profiles: { name: "Alex Rover", username: "alex_r" }
    },
    profiles: { name: "Ben Taylor", username: "ben_dev" }
  }
];

export default async function PublicLandingPage() {
  const supabase = isSupabaseConfigured() ? await createSupabaseServerClient() : null;

  // 1. Fetch Featured Ideas
  let featuredIdeas: IdeaWithProfile[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("ideas")
      .select("id,title,description,quality_score,project_level,tags,required_skills,created_at,profiles:posted_by_user_id(name,username)")
      .eq("visibility", "PUBLISHED")
      .gte("quality_score", 7.5)
      .order("created_at", { ascending: false })
      .limit(3);
    
    if (data && data.length > 0) {
      const statsMap = await fetchIdeaStatsMap(supabase as never, data.map(i => i.id));
      const rawIdeas = data as unknown as Array<{
        id: string;
        title: string;
        description: string;
        quality_score: number | null;
        project_level: string | null;
        tags: string[];
        required_skills: string[];
        created_at: string;
        profiles: IdeaProfile | IdeaProfile[] | null;
      }>;
      
      featuredIdeas = rawIdeas.map((idea) => {
        const stats = statsMap[idea.id] ?? {
          derivedStatus: "IDEA" as const,
          implementationCount: 0,
          builtCount: 0,
        };
        const profile = Array.isArray(idea.profiles) ? idea.profiles[0] : idea.profiles;
        return {
          ...idea,
          ...stats,
          profiles: profile || null
        };
      });
    }
  }

  if (featuredIdeas.length === 0) {
    featuredIdeas = mockFeaturedIdeas;
  }

  // 2. Fetch Built Projects
  let builtProjects: ImplementationWithProfiles[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("implementations")
      .select("id,build_title,deployed_url,github_repo_url,ideas!inner(id,title,visibility,posted_by_user_id,profiles:posted_by_user_id(name,username)),profiles:lead_user_id(name,username)")
      .not("deployed_url", "is", null)
      .eq("ideas.visibility", "PUBLISHED")
      .order("updated_at", { ascending: false })
      .limit(3);
    
    if (data && data.length > 0) {
      const rawBuilds = data as unknown as Array<{
        id: string;
        build_title: string | null;
        deployed_url: string | null;
        github_repo_url: string;
        ideas: {
          id: string;
          title: string;
          visibility: string;
          posted_by_user_id: string;
          profiles: IdeaProfile | IdeaProfile[] | null;
        } | {
          id: string;
          title: string;
          visibility: string;
          posted_by_user_id: string;
          profiles: IdeaProfile | IdeaProfile[] | null;
        }[] | null;
        profiles: IdeaProfile | IdeaProfile[] | null;
      }>;

      builtProjects = rawBuilds.map((build) => {
        const rawIdea = Array.isArray(build.ideas) ? build.ideas[0] : build.ideas;
        const ideaProfile = rawIdea ? (Array.isArray(rawIdea.profiles) ? rawIdea.profiles[0] : rawIdea.profiles) : null;
        const leadProfile = Array.isArray(build.profiles) ? build.profiles[0] : build.profiles;

        return {
          id: build.id,
          build_title: build.build_title,
          deployed_url: build.deployed_url,
          github_repo_url: build.github_repo_url,
          ideas: rawIdea ? {
            title: rawIdea.title,
            profiles: ideaProfile || null
          } : null,
          profiles: leadProfile || null
        };
      });
    }
  }

  if (builtProjects.length === 0) {
    builtProjects = mockBuiltProjects;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Marketing Header */}
      <MarketingHeader />

      {/* Hero Notification Banner */}
      <div className="bg-primary/10 py-2.5 text-center text-xs font-semibold text-primary">
        Builder Network is now live - discover ideas or start building today.
      </div>

      {/* Centered Deep Navy Hero Band */}
      <section className="bg-brand-navy text-[#f8fafc] py-20 px-6 relative overflow-hidden border-b border-border/10">
        {/* Mesh wire pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 pointer-events-none" />

        {/* Mockup Ambient Glow */}
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-primary/20 via-purple-600/10 to-transparent rounded-full blur-[130px] opacity-40 pointer-events-none z-0" />

        {/* Floating Sticky Idea Note */}
        <div className="absolute top-[18%] left-[3%] w-52 rounded-xl border border-orange-200/10 bg-[#fffbf9]/95 backdrop-blur-md p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.3)] hidden xl:block animate-float-slow z-30 -rotate-6 select-none">
          <div className="flex items-center justify-between mb-2">
            <span className="rounded bg-orange-100/80 px-1.5 py-0.5 text-[9px] font-bold text-orange-800 uppercase tracking-wider">IDEA</span>
            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
              ★ 8.8
            </span>
          </div>
          <h4 className="font-heading text-xs font-bold text-slate-800">AI Micro-SaaS Accelerator</h4>
          <p className="mt-1 text-[10px] text-slate-500 leading-normal">Fast, zero-config pipeline runner with automated AI debugging.</p>
          <div className="mt-3 border-t border-slate-100 pt-2 flex items-center justify-between text-[9px] text-slate-400 font-medium">
            <span>Next.js · Rust</span>
            <span>2 builds</span>
          </div>
        </div>

        {/* Floating Sticky Build Note */}
        <div className="absolute top-[14%] right-[3%] w-52 rounded-xl border border-emerald-200/10 bg-[#f7fdfb]/95 backdrop-blur-md p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.3)] hidden xl:block animate-float-medium z-30 rotate-3 select-none">
          <div className="flex items-center justify-between mb-2">
            <span className="rounded bg-emerald-100/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 uppercase tracking-wider">BUILT</span>
            <span className="text-[10px] text-slate-400 font-medium">Deployed</span>
          </div>
          <h4 className="font-heading text-xs font-bold text-slate-800">Offline-First Personal Wiki</h4>
          <p className="mt-1 text-[10px] text-slate-500 leading-normal">Markdown local editor syncing with SQLite in the browser.</p>
          <div className="mt-3 border-t border-slate-100 pt-2 flex items-center justify-between text-[9px] text-slate-400 font-medium">
            <span>React · SQLite</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
              ● Live demo
            </span>
          </div>
        </div>

        {/* Floating Sticky Activity Note */}
        <div className="absolute bottom-[20%] left-[2%] w-48 rounded-xl border border-purple-200/10 bg-[#fbf9ff]/95 backdrop-blur-md p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.3)] hidden xl:block animate-float-fast z-30 rotate-6 select-none">
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-slate-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" />
            <span>PARALLEL BUILD</span>
          </div>
          <h4 className="font-heading text-xs font-bold text-slate-800">2 Teams Joined Idea</h4>
          <p className="mt-1 text-[10px] text-slate-500 leading-normal">Max credit is split automatically under open attribution model.</p>
        </div>

        {/* Floating Sticky Tech Note */}
        <div className="absolute bottom-[22%] right-[2%] w-48 rounded-xl border border-blue-200/10 bg-[#f9fcff]/95 backdrop-blur-md p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.3)] hidden xl:block animate-float-slow z-30 -rotate-3 select-none">
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] text-slate-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>GITHUB SYNC</span>
          </div>
          <h4 className="font-heading text-xs font-bold text-slate-800">Auto Crediting</h4>
          <p className="mt-1 text-[10px] text-slate-500 leading-normal">Syncs repository branches and attributes commit history to builders.</p>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md mb-8 hover:bg-primary/20 transition-all cursor-default shadow-[0_0_15px_rgba(124,58,237,0.1)]">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[#e2e8f0]">Introducing Builder Network 1.0</span>
            <span className="text-[#a78bfa] font-medium">— get automatic AI feedback</span>
          </div>

          <h1 className="max-w-4xl font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] -tracking-[1.5px] md:-tracking-[3.5px]">
            Stop scrolling project ideas.
            <br />
            <span className="bg-gradient-to-r from-primary via-[#a78bfa] to-[#c7d2e1] bg-clip-text text-transparent drop-shadow-sm">
              Start building them.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-[#c7d2e1]/95 leading-relaxed font-light">
            An AI-reviewed project idea platform where builders can discover high-signal ideas, start implementations, connect with teammates, and showcase launched products.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/ideas"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "bg-primary hover:bg-primary/95 text-white font-semibold rounded-md px-6 py-3 shadow-[0_4px_20px_rgba(124,58,237,0.3)] transition-all text-sm h-11",
              })}
            >
              Explore Ideas
            </Link>
            <Link
              href="/ideas/submit"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "border-[#c7d2e1]/30 text-[#f8fafc] hover:bg-white/10 font-semibold rounded-md px-6 py-3 transition-all text-sm bg-transparent h-11",
              })}
            >
              Submit an Idea
            </Link>
          </div>

          {/* Social Proof Line */}
          <p className="mt-6 text-xs text-[#c7d2e1]/65 font-light flex items-center gap-1.5 justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            Join creators & builders shipping products daily.
          </p>

          {/* Interactive Workspace Mockup Card */}
          <div className="mt-16 w-full max-w-4xl relative z-20">
            <WorkspaceMockupCard />
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="mx-auto w-full max-w-6xl px-6 py-16 space-y-20">
        
        {/* Why Building is Broken */}
        <ProblemSection />

        {/* Chronological Timeline Pipeline */}
        <PipelineSection />

        {/* High-Emphasis AI Review Section */}
        <AIReviewSection />

        {/* Multi-Builder Section */}
        <MultiBuilderSection />

        {/* Tech Stack Logos scrolling strip */}
        <TechStackLogos />

        {/* Featured Ideas Section */}
        <section className="space-y-8 pt-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Featured Project Ideas
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                High-quality ideas reviewed by AI and ready for code.
              </p>
            </div>
            <Link
              href="/ideas"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              View all ideas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {featuredIdeas.map((idea) => {
              const authorLabel = idea.profiles?.username
                ? `@${idea.profiles.username}`
                : (idea.profiles?.name ?? "Unknown builder");

              return (
                <div
                  key={idea.id}
                  className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:shadow-sm transition-all"
                >
                  <div className="space-y-4">
                    {/* Header Tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {idea.quality_score && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#eefcf2] dark:bg-emerald-950/20 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-100/50">
                          <Sparkles className="h-2.5 w-2.5" /> Score {idea.quality_score.toFixed(1)}
                        </span>
                      )}
                      {idea.project_level && (
                        <span className="inline-flex items-center rounded-md bg-card-tint-peach px-2 py-0.5 text-[10px] font-bold text-brand-orange-deep dark:text-orange-300 border border-orange-100/50">
                          {idea.project_level}
                        </span>
                      )}
                    </div>

                    {/* Title & Desc */}
                    <div>
                      <h3 className="font-heading text-lg font-bold text-ink leading-snug line-clamp-1">
                        {idea.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                        {idea.description}
                      </p>
                    </div>

                    {/* Skills Tags */}
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {idea.required_skills?.slice(0, 3).map((skill: string) => (
                          <span
                            key={skill}
                            className="rounded bg-card-tint-lavender px-1.5 py-0.5 text-[9px] font-semibold text-brand-purple-800 dark:text-purple-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer metadata & buttons */}
                  <div className="mt-6 border-t border-border pt-4 space-y-4">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>By {authorLabel}</span>
                      <span>
                        {idea.implementationCount || 0} builds · {idea.derivedStatus || "IDEA"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/ideas/${idea.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className: "w-full text-xs font-semibold rounded-md border-border bg-transparent hover:bg-muted text-ink h-8.5",
                        })}
                      >
                        Details
                      </Link>
                      <Link
                        href={`/ideas/${idea.id}`}
                        className={buttonVariants({
                          variant: "default",
                          size: "sm",
                          className: "w-full text-xs font-semibold rounded-md bg-primary hover:bg-primary/90 text-white h-8.5",
                        })}
                      >
                        Build
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Built Projects Section */}
        <section className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Recent Built Projects
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                See what builders have shipped from our public idea pool.
              </p>
            </div>
            <Link
              href="/ideas?status=BUILT"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Explore built projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {builtProjects.map((build) => {
              const leadLabel = build.profiles?.username
                ? `@${build.profiles.username}`
                : (build.profiles?.name ?? "Unknown lead");

              const creatorLabel = build.ideas?.profiles?.username
                ? `@${build.ideas.profiles.username}`
                : (build.ideas?.profiles?.name ?? "creator");

              return (
                <div
                  key={build.id}
                  className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between hover:shadow-sm transition-all"
                >
                  <div className="space-y-4">
                    {/* Header: Lead developer badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>Lead: <strong className="text-ink">{leadLabel}</strong></span>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">
                        Built
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-heading text-lg font-bold text-ink leading-snug line-clamp-1">
                        {build.build_title || build.ideas?.title || "Untitled project"}
                      </h3>
                      <p className="mt-1 text-[11px] text-muted-foreground italic">
                        Inspired by &ldquo;{build.ideas?.title || "Original Idea"}&rdquo; by {creatorLabel}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Links */}
                  <div className="mt-6 border-t border-border pt-4 flex items-center justify-between gap-3">
                    <a
                      href={build.github_repo_url || "https://github.com"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-ink transition-colors"
                    >
                      <GithubIcon className="h-4 w-4" />
                      <span>Code</span>
                    </a>

                    {build.deployed_url && (
                      <a
                        href={build.deployed_url}
                        target="_blank"
                        rel="noreferrer"
                        className={buttonVariants({
                          variant: "default",
                          size: "sm",
                          className: "inline-flex items-center gap-1 bg-primary hover:bg-primary/95 text-white font-medium rounded-md px-3.5 h-8 text-xs shadow-sm",
                        })}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA block */}
        <FinalCTA />

        {/* Footnotes & Footer links */}
        <Footer />
      </main>
    </div>
  );
}

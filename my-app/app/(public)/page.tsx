import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Footer } from "@/components/layout/footer";
import { FAQSection } from "@/components/faq-section";
import { PipelineSection } from "@/components/pipeline-section";
import { ProblemSection } from "@/components/problem-section";
import { FinalCTA } from "@/components/final-cta";
import { AIReviewSection } from "@/components/ai-review-section";
import { TechStackLogos } from "@/components/tech-stack-logos";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Builder Network | Ship real projects",
  description:
    "Discover high-signal project ideas, get structured AI review, and publish execution-ready concepts for builders.",
};

export default async function PublicLandingPage() {
  const supabase = isSupabaseConfigured() ? await createSupabaseServerClient() : null;
  const { data: featuredIdeas } = supabase
    ? await supabase
        .from("ideas")
        .select("id,title,quality_score")
        .eq("visibility", "PUBLISHED")
        .gte("quality_score", 7.5)
        .order("created_at", { ascending: false })
        .limit(6)
    : { data: [] as Array<{ id: string; title: string; quality_score: number | null }> };

  const { data: builtProjects } = supabase
    ? await supabase
        .from("implementations")
        .select("id,build_title,deployed_url,ideas!inner(title,visibility)")
        .not("deployed_url", "is", null)
        .eq("ideas.visibility", "PUBLISHED")
        .order("updated_at", { ascending: false })
        .limit(6)
    : {
        data: [] as Array<{
          id: string;
          build_title: string | null;
          deployed_url: string | null;
          ideas: { title: string | null } | null;
        }>,
      };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-4 rounded-md bg-primary px-4 py-2 text-center text-sm text-primary-foreground">
        Builder Network is now live - start building today.
      </div>
      <section className="shadow-mockup mt-4 grid gap-6 rounded-lg border border-border bg-brand-navy p-8 text-on-dark">
        <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Stop scrolling project ideas.
          <br />
          Start building them with real developers.
        </h1>
        <p className="max-w-2xl text-base leading-7 text-on-dark-muted">
          Discover execution-ready startup ideas, get AI validation, find teammates, and ship real portfolio projects.
        </p>
        <div className="flex gap-3">
          <Link href="/ideas" className={buttonVariants({ variant: "default" })}>
            Explore ideas
          </Link>
          <Link
            href="/ideas/submit"
            className={buttonVariants({
              variant: "outline",
              className: "border-on-dark-muted text-ink hover:bg-on-dark/10",
            })}
          >
            Submit idea
          </Link>
        </div>
      </section>

      <ProblemSection />
      <PipelineSection />
      <AIReviewSection />
      <TechStackLogos />

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-2xl text-ink">Featured ideas</h2>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            {(featuredIdeas ?? []).map((idea) => (
              <Link key={idea.id} href={`/ideas/${idea.id}`} className="block underline">
                {idea.title} {idea.quality_score ? `(Score ${idea.quality_score.toFixed(1)})` : ""}
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-2xl text-ink">Recent built projects</h2>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            {(builtProjects ?? []).map((build) => (
              <Link key={build.id} href={`/implementations/${build.id}`} className="block underline">
                {(build.build_title || (build.ideas as { title: string | null }[])?.[0]?.title) ?? "Untitled build"}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <FAQSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}

import { CheckCircle2 } from "lucide-react";

const reviewItems = [
  "Quality score (0-10)",
  "Project difficulty level",
  "Required skills",
  "Project tags",
  "Market alternatives",
  "Worthiness review",
  "Feasibility analysis",
  "Improvement suggestions",
];

export function AIReviewSection() {
  return (
    <section className="mt-16">
      <div className="rounded-lg border border-border bg-primary/5 p-8">
        <h2 className="font-heading text-2xl text-ink">What AI Reviews</h2>
        <p className="mt-2 text-muted-foreground">
          Every idea gets analyzed with:
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {reviewItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-ink">{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          The AI never rewrites your idea — it only scores, classifies, and suggests improvements to help you build better.
        </p>
      </div>
    </section>
  );
}
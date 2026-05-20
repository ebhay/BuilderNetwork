import { Check, Sparkles } from "lucide-react";

const reviewItems = [
  { label: "Quality score & quality band", desc: "Instantly categorizes ideas from Needs Revision to Excellent." },
  { label: "Difficulty level inference", desc: "Tags projects as Beginner, Intermediate, or Expert." },
  { label: "Automatic skills & tags detection", desc: "Detects needed skills like Frontend, Database, or AI." },
  { label: "Market alternatives analysis", desc: "Identifies similar category products and differentiators." },
  { label: "Honest feedback & suggestions", desc: "Gives brutal but highly actionable design suggestions." },
];

export function AIReviewSection() {
  return (
    <section className="mt-16">
      <div className="rounded-xl border border-yellow-200 dark:border-yellow-900/30 bg-card-tint-yellow-bold p-8 dark:bg-card-tint-yellow-bold/5">
        <div className="grid gap-8 lg:grid-cols-12 items-center">
          {/* Left Column: Text Information */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-200/60 dark:bg-yellow-900/30 px-3 py-1 text-xs font-bold text-yellow-800 dark:text-yellow-300">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              AI Review Gate
            </div>
            
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-[#1f2937] dark:text-yellow-100 sm:text-4xl">
              Automated Idea Validation
            </h2>
            <p className="text-sm text-yellow-900/80 dark:text-yellow-200/80 leading-relaxed max-w-xl">
              Every project idea undergoes a structured AI quality pipeline. We do not rewrite your human title or description—we extract technical metadata to help builders select the best path.
            </p>

            <div className="space-y-4">
              {reviewItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1f2937] text-white dark:bg-yellow-950 dark:text-yellow-300 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-bold text-[#1f2937] dark:text-yellow-100">
                      {item.label}
                    </h4>
                    <p className="mt-0.5 text-xs text-yellow-900/70 dark:text-yellow-200/70">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Mockup Output */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-lg border border-border bg-background p-5 shadow-sm text-foreground">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-3 mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Job Result Preview
                  </span>
                </div>
                <span className="rounded bg-yellow-100 dark:bg-yellow-950/30 px-2 py-0.5 text-[10px] font-bold text-yellow-800 dark:text-yellow-300">
                  Reviewed
                </span>
              </div>

              {/* Inferred Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Quality Rating</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">7.2 Good</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Difficulty</span>
                  <span className="text-xs font-semibold rounded bg-card-tint-peach px-2 py-0.5 text-brand-orange-deep dark:text-orange-300">
                    Intermediate
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Required Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {["Frontend", "Database", "API Integration"].map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-card-tint-lavender px-1.5 py-0.5 text-[10px] font-bold text-brand-purple-800 dark:text-purple-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <span className="text-xs font-bold text-ink block mb-1">Suggestions</span>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    “Differentiate from enterprise products by targeting individual creators. Add custom Slack notify hooks as first priority.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
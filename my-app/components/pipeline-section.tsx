import { Lightbulb, Bot, GitBranch, Rocket } from "lucide-react";

const steps = [
  {
    stepNum: "01",
    icon: Lightbulb,
    title: "Submit Idea",
    description: "Submit your title and description. AI infers required skills and tags for you.",
    badgeBg: "bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400",
  },
  {
    stepNum: "02",
    icon: Bot,
    title: "AI Quality Review",
    description: "AI scores the project, reviews feasibility, and suggests concrete improvements.",
    badgeBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400",
  },
  {
    stepNum: "03",
    icon: GitBranch,
    title: "Builders Connect",
    description: "Start building by pasting a GitHub repository URL. Collaborate with teammates.",
    badgeBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
  },
  {
    stepNum: "04",
    icon: Rocket,
    title: "Ship Live Demo",
    description: "Submit your final deployed URL to complete the loop and showcase your product.",
    badgeBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400",
  },
];

export function PipelineSection() {
  return (
    <section className="mt-16">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          The Build Pipeline
        </h2>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          From concept validation to final deployment. Here is how Builder Network powers execution.
        </p>
      </div>

      <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group relative rounded-xl border border-border bg-card p-6 flex flex-col justify-between gap-6 transition-all hover:border-muted-foreground/30 hover:shadow-sm"
          >
            {/* Step Number Badge */}
            <div className="flex items-center justify-between">
              <span className="font-heading text-3xl font-extrabold tracking-tight text-muted-foreground/35 group-hover:text-primary/45 transition-colors">
                {step.stepNum}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${step.badgeBg}`}>
                <step.icon className="h-4.5 w-4.5" />
              </div>
            </div>

            {/* Step Text */}
            <div>
              <h3 className="font-heading text-lg font-bold text-ink transition-colors group-hover:text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
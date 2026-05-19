import { ArrowRight, Lightbulb, Bot, GitBranch, Rocket } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    title: "Submit idea",
    description: "Post your project idea with title, description, and optional screenshot.",
  },
  {
    icon: Bot,
    title: "AI reviews",
    description: "Our AI scores quality, infers skills, tags scope, and suggests improvements.",
  },
  {
    icon: GitBranch,
    title: "Builders start",
    description: "Anyone can start building with a GitHub repo link. Multiple builds per idea.",
  },
  {
    icon: Rocket,
    title: "Ship it",
    description: "Add your deployed link when done. Built projects showcase on profiles.",
  },
];

export function PipelineSection() {
  return (
    <section className="mt-16">
      <h2 className="font-heading text-2xl text-ink">How it works</h2>
      <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-1 flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <step.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-heading text-lg text-ink">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            {index < steps.length - 1 && (
              <div className="absolute hidden -right-3 top-6 md:block">
                <ArrowRight className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
import { GraduationCap, Lightbulb, Users, Search, Filter, UsersRound } from "lucide-react";

const painPoints = [
  {
    icon: GraduationCap,
    title: "Skills without direction",
    description:
      "College students and self-learners have technical skills but no clear path to build impressive projects that stand out.",
  },
  {
    icon: Lightbulb,
    title: "Ideas die in the shadows",
    description:
      "Millions of great project ideas never get built. People lack the time, confidence, or technical know-how to execute.",
  },
  {
    icon: Users,
    title: "Building alone is hard",
    description:
      "Even with a great idea, finding the right teammates is a challenge. Solo builders often lose momentum and quit.",
  },
];

const whyItFails = [
  {
    icon: Search,
    title: "No discovery platform",
    description: "Good ideas stay hidden in people's heads or random group chats.",
  },
  {
    icon: Filter,
    title: "No quality filter",
    description: "No way to know which ideas are worth investing time in.",
  },
  {
    icon: UsersRound,
    title: "No collaboration infrastructure",
    description: "Finding and coordinating teammates requires outside tools.",
  },
];

export function ProblemSection() {
  return (
    <section className="mt-16">
      <div className="text-center">
        <h2 className="font-heading text-3xl text-ink">Why building is broken</h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Three walls stop every builder from shipping real projects.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {painPoints.map((point, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg border border-border bg-background p-6"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <point.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-heading text-xl text-ink">{point.title}</h3>
            <p className="mt-2 text-muted-foreground">{point.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-secondary/30 p-6">
        <h3 className="font-heading text-lg text-ink">Why existing solutions don&apos;t work</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {whyItFails.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <item.icon className="mt-1 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { GraduationCap, Lightbulb, Users, Search, Filter, UsersRound } from "lucide-react";

const painPoints = [
  {
    icon: GraduationCap,
    title: "Skills without direction",
    description:
      "Students and self-learners have coding skills but no clear roadmap to build impressive, real-world portfolio projects.",
    bgColor: "bg-card-tint-lavender dark:bg-card-tint-lavender/5",
    textColor: "text-brand-purple-800 dark:text-purple-300",
    borderColor: "border-purple-200/50 dark:border-purple-900/30",
    iconBg: "bg-purple-100 dark:bg-purple-950/30",
  },
  {
    icon: Lightbulb,
    title: "Ideas die in the shadows",
    description:
      "Millions of great project ideas never get built. Innovators lack the technical confidence, time, or teammates to execute.",
    bgColor: "bg-card-tint-peach dark:bg-card-tint-peach/5",
    textColor: "text-brand-orange-deep dark:text-orange-300",
    borderColor: "border-orange-200/50 dark:border-orange-900/30",
    iconBg: "bg-orange-100 dark:bg-orange-950/30",
  },
  {
    icon: Users,
    title: "Building alone is hard",
    description:
      "Even with a clear idea, finding reliable collaborators is challenging. Solo builders often lose momentum and quit.",
    bgColor: "bg-card-tint-rose dark:bg-card-tint-rose/5",
    textColor: "text-rose-700 dark:text-rose-300",
    borderColor: "border-rose-200/50 dark:border-rose-900/30",
    iconBg: "bg-rose-100 dark:bg-rose-950/30",
  },
];

const whyItFails = [
  {
    icon: Search,
    title: "No Discovery Hub",
    description: "High-potential project ideas stay hidden in private messages or random forums.",
  },
  {
    icon: Filter,
    title: "Zero Quality Filter",
    description: "No mechanism to filter out noise and highlight execution-ready specifications.",
  },
  {
    icon: UsersRound,
    title: "No Teaming Infrastructure",
    description: "Coordinating builds, repo links, and teammates requires manual external tools.",
  },
];

export function ProblemSection() {
  return (
    <section className="mt-16">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Why Building Projects is Broken
        </h2>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Three major obstacles prevent developers, designers, and innovators from successfully launching software.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {painPoints.map((point, index) => (
          <div
            key={index}
            className={`rounded-lg border p-6 flex flex-col items-start gap-4 transition-all hover:shadow-sm ${point.bgColor} ${point.borderColor}`}
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${point.iconBg} ${point.textColor}`}>
              <point.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`font-heading text-lg font-bold ${point.textColor}`}>{point.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{point.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-card p-6 md:p-8">
        <h3 className="font-heading text-lg font-semibold text-ink">Why traditional directories fail</h3>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {whyItFails.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
                <item.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

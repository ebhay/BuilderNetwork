import { GitBranch, ShieldAlert, Users } from "lucide-react";

export function MultiBuilderSection() {
  const cards = [
    {
      icon: GitBranch,
      title: "No Gatekeeping",
      description:
        "Unlike platforms that restrict execution, we support multiple independent builders or teams working on separate implementations of the same idea in parallel.",
    },
    {
      icon: ShieldAlert,
      title: "Attribution by Default",
      description:
        "Every single build page automatically links back and credits the original idea creator. Share ideas freely, knowing you will be credited for the inspiration.",
    },
    {
      icon: Users,
      title: "Collaborative Teams",
      description:
        "Connect with teammates easily. Check implementation leads' public social links or send a direct join request to become a collaborator on an active build.",
    },
  ];

  return (
    <section className="mt-16 rounded-xl bg-card-tint-sky p-8 dark:bg-card-tint-sky/5 md:p-12 border border-border">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          One Idea. Multiple Builds.
        </h2>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Ideas are open opportunities, not barriers. We connect people with original concepts to developers who want to execute, allowing parallel implementations and clear attribution.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {cards.map((card, index) => (
          <div
            key={index}
            className="flex flex-col items-start gap-4 rounded-lg bg-background p-6 border border-border/60 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <card.icon className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-ink">{card.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

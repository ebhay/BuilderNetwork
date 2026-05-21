import Link from "next/link";

const tabs = [
  { key: "ideas", label: "My Ideas" },
  { key: "builds", label: "My Builds" },
  { key: "drafts", label: "Drafts" },
  { key: "saved", label: "Saved Ideas" },
] as const;

export function DashboardTabs({ active }: { active: string }) {
  return (
    <nav className="inline-flex w-full flex-wrap gap-1 border-b border-border pb-1">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={`/dashboard?tab=${tab.key}`}
            className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-[5px] ${
              isActive
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-ink hover:border-border"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

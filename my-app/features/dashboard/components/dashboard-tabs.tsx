import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const tabs = [
  { key: "ideas", label: "My Ideas" },
  { key: "builds", label: "My Builds" },
  { key: "requests", label: "Join Requests" },
  { key: "drafts", label: "Drafts" },
  { key: "saved", label: "Saved Ideas" },
] as const;

export function DashboardTabs({ active }: { active: string }) {
  return (
    <nav className="flex flex-wrap gap-2 rounded-md border border-border bg-card p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`/dashboard?tab=${tab.key}`}
          className={buttonVariants({
            variant: active === tab.key ? "default" : "ghost",
          })}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

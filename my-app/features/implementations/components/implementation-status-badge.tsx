import { Badge } from "@/components/ui/badge";

export function ImplementationStatusBadge({
  status,
  tone = "default",
}: {
  status: "IN_PROGRESS" | "BUILT";
  tone?: "default" | "dark";
}) {
  const builtClass =
    tone === "dark"
      ? "rounded-md bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-300/30"
      : "rounded-md bg-primary text-primary-foreground";

  const progressClass =
    tone === "dark"
      ? "rounded-md border-white/35 bg-white/10 text-white hover:bg-white/15"
      : "rounded-md";

  if (status === "BUILT") {
    return <Badge className={builtClass}>Built</Badge>;
  }
  return (
    <Badge variant="outline" className={progressClass}>
      In progress
    </Badge>
  );
}

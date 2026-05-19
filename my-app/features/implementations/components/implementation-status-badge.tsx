import { Badge } from "@/components/ui/badge";

export function ImplementationStatusBadge({ status }: { status: "IN_PROGRESS" | "BUILT" }) {
  if (status === "BUILT") {
    return <Badge className="rounded-md bg-primary text-primary-foreground">Built</Badge>;
  }
  return <Badge variant="outline" className="rounded-md">In progress</Badge>;
}

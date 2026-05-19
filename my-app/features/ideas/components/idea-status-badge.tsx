import { Badge } from "@/components/ui/badge";

export function IdeaStatusBadge({ visibility }: { visibility: "PUBLISHED" | "NEEDS_REFINEMENT" | "DRAFT" }) {
  if (visibility === "PUBLISHED") {
    return <Badge className="rounded-md bg-primary text-primary-foreground">Published</Badge>;
  }
  if (visibility === "NEEDS_REFINEMENT") {
    return <Badge className="rounded-md bg-accent text-accent-foreground">Needs refinement</Badge>;
  }
  return <Badge variant="outline" className="rounded-md">Draft</Badge>;
}

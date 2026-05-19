import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SentJoinRequest = {
  id: string;
  implementation_id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  implementationTitle: string;
  ideaTitle: string;
  lead: { id: string; name: string | null; coding_level: string | null } | null;
};

export function SentJoinRequestsList({ items }: { items: SentJoinRequest[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
        <p>No sent join requests.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <Card key={item.id} className="border border-border">
          <CardHeader className="space-y-2 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="font-heading text-lg">{item.implementationTitle || item.ideaTitle}</CardTitle>
              <Badge variant="outline" className="rounded-md">
                {item.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Lead: {item.lead?.name ?? "Unknown"} {item.lead?.coding_level ? `· ${item.lead.coding_level}` : ""}
            </p>
          </CardHeader>
          <CardContent>
            <Link href={`/implementations/${item.implementation_id}`} className="text-sm underline">
              View build
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

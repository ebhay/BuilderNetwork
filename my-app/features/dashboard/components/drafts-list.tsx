import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function DraftsList({
  drafts,
}: {
  drafts: Array<{ id: string; title: string; review_status: string; visibility: string }>;
}) {
  if (drafts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border p-12 text-center text-muted-foreground">
        <p>No drafts or ideas pending review.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {drafts.map((draft) => (
        <Card key={draft.id} className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">{draft.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <p>{draft.visibility} · {draft.review_status}</p>
            <Link href={`/ideas/${draft.id}/review`} className={buttonVariants({ variant: "outline" })}>
              Open review
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

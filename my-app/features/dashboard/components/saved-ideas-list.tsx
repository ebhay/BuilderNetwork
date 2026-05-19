import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export function SavedIdeasList({
  ideas,
}: {
  ideas: Array<{ id: string; title: string; quality_score: number | null }>;
}) {
  if (ideas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border p-12 text-center text-muted-foreground">
        <p>No saved ideas.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {ideas.map((idea) => (
        <Card key={idea.id} className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">{idea.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>{idea.quality_score ? `Score ${idea.quality_score.toFixed(1)}` : "No score yet"}</p>
            <Link href={`/ideas/${idea.id}`} className={buttonVariants({ variant: "outline" })}>
              View idea
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

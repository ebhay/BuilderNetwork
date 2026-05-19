import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export function MyIdeasList({
  ideas,
}: {
  ideas: Array<{
    id: string;
    title: string;
    visibility: string;
    review_status: string;
    quality_score: number | null;
    implementationCount: number;
    builtCount: number;
  }>;
}) {
  if (ideas.length === 0) {
    return (
      <Card className="border border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="mb-4 text-muted-foreground">You haven&apos;t submitted any ideas yet.</p>
          <Link href="/ideas/submit" className={buttonVariants({ variant: "default" })}>
            Submit your first idea
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {ideas.map((idea) => (
        <Card key={idea.id} className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="font-heading text-lg">{idea.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-md">{idea.visibility}</Badge>
              <Badge variant="outline" className="rounded-md">{idea.review_status}</Badge>
              {idea.quality_score ? (
                <Badge variant="outline" className="rounded-md">{idea.quality_score.toFixed(1)}</Badge>
              ) : null}
            </div>
            <p>{idea.implementationCount} builds · {idea.builtCount} built</p>
            <div className="flex gap-2">
              <Link href={`/ideas/${idea.id}`} className={buttonVariants({ variant: "outline" })}>
                View
              </Link>
              <Link href={`/ideas/${idea.id}/review`} className={buttonVariants({ variant: "outline" })}>
                Review page
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

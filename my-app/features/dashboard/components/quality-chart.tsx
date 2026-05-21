import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type QualityChartProps = {
  ideas: { id: string; title: string; quality_score: number | null }[];
};

export function QualityChart({ ideas }: QualityChartProps) {
  // Show top 5 ideas by quality_score (non-null)
  const sorted = ideas
    .filter((i) => i.quality_score !== null)
    .sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0))
    .slice(0, 5);

  return (
    <Card className="border border-border/60 bg-card/80 rounded-xl overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Top Idea Quality Scores
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <ul className="space-y-3">
          {sorted.map((idea) => (
            <li key={idea.id} className="flex items-center gap-2">
              <span className="w-32 text-xs font-medium text-muted-foreground truncate">
                {idea.title}
              </span>
              <div className="flex-1 h-4 bg-muted/30 rounded">
                <div
                  className="h-4 bg-primary rounded"
                  style={{ width: `${(idea.quality_score ?? 0) * 10}%` }}
                />
              </div>
              <span className="w-12 text-sm font-medium text-ink">
                {idea.quality_score?.toFixed(1) ?? "-"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

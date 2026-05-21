import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SummaryCardsProps = {
  publishedCount: number;
  draftCount: number;
  activeBuildCount: number;
  avgScore: string;
};

export function SummaryCards({ publishedCount, draftCount, activeBuildCount, avgScore }: SummaryCardsProps) {
  const cards = [
    { label: "Published Ideas", value: publishedCount, textClass: "text-ink" },
    { label: "Drafts", value: draftCount, textClass: "text-ink" },
    { label: "Active Builds", value: activeBuildCount, textClass: "text-ink" },
    { label: "Avg. Quality Score", value: avgScore, textClass: "text-primary" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="border border-border/60 bg-card/80 shadow-sm rounded-xl">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {c.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className={`text-2xl font-bold ${c.textClass}`}>{c.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

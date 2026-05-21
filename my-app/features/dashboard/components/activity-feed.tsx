import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

type ActivityItem = {
  id: string;
  message: string;
  timestamp?: string;
};

type ActivityFeedProps = {
  activities: ActivityItem[];
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="border border-border/60 bg-card/80 rounded-xl overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 max-h-64">
        <ScrollArea className="h-full">
          <ul className="space-y-2 text-sm text-ink">
            {activities.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <span className="flex h-2 w-2 flex-shrink-0 rounded-full bg-primary mt-1.5" />
                <span>{item.message}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

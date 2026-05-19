import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { respondJoinRequestAction } from "@/features/join-requests/actions";

type ReceivedJoinRequest = {
  id: string;
  implementation_id: string;
  message: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  requester: { id: string; name: string | null; coding_level: string | null } | null;
  implementationTitle: string;
  ideaTitle: string;
};

export function ReceivedJoinRequestsList({ items }: { items: ReceivedJoinRequest[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border p-8 text-center text-sm text-muted-foreground">
        <p>No received join requests.</p>
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
              Requester: {item.requester?.name ?? "Unknown"} {item.requester?.coding_level ? `· ${item.requester.coding_level}` : ""}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {item.message ? <p className="text-sm text-muted-foreground">{item.message}</p> : null}
            <div className="flex flex-wrap gap-2">
              {item.status === "PENDING" ? (
                <>
                  <form action={respondJoinRequestAction}>
                    <input type="hidden" name="joinRequestId" value={item.id} />
                    <input type="hidden" name="decision" value="ACCEPT" />
                    <Button type="submit" size="sm">
                      Accept
                    </Button>
                  </form>
                  <form action={respondJoinRequestAction}>
                    <input type="hidden" name="joinRequestId" value={item.id} />
                    <input type="hidden" name="decision" value="REJECT" />
                    <Button type="submit" size="sm" variant="outline">
                      Reject
                    </Button>
                  </form>
                </>
              ) : null}
              <Link href={`/implementations/${item.implementation_id}`} className="text-sm underline">
                View build
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

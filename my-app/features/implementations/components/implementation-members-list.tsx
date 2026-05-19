import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ImplementationMember = {
  user_id: string;
  name: string | null;
  profile_image_url: string | null;
  coding_level: string | null;
  role: "LEAD" | "TEAMMATE";
};

export function ImplementationMembersList({ members }: { members: ImplementationMember[] }) {
  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        {members.length ? (
          members.map((member) => (
            <p key={member.user_id}>
              {member.name ?? "Unknown"} ({member.role}) {member.coding_level ? `· ${member.coding_level}` : ""}
            </p>
          ))
        ) : (
          <p>No teammates yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

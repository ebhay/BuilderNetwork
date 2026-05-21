import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateMemberRoleFocusAction } from "@/features/implementations/actions";
import { Input } from "@/components/ui/input";

type ImplementationMember = {
  user_id: string;
  name: string | null;
  username?: string | null;
  profile_image_url: string | null;
  coding_level: string | null;
  role: "LEAD" | "TEAMMATE";
  role_focus?: string | null;
};

export function ImplementationMembersList({
  members,
  isLead = false,
  implementationId,
}: {
  members: ImplementationMember[];
  isLead?: boolean;
  implementationId?: string;
}) {
  return (
    <Card className="border border-border bg-card/90 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-xl">Build team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.length ? (
          members.map((member) => (
            <div
              key={member.user_id}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                    {member.profile_image_url ? (
                      <Image
                        src={member.profile_image_url}
                        alt={member.name ?? "Builder"}
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-ink">
                        {(member.name?.slice(0, 1) ?? "B").toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-ink">{member.name ?? "Builder"}</p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {member.coding_level ?? "Builder"}
                    </p>
                    {member.role_focus ? (
                      <p className="mt-1 text-xs text-primary">Focus: {member.role_focus}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <Link
                    href={`/u/${member.username ?? member.user_id}`}
                    className={buttonVariants({ variant: "outline", className: "h-8 rounded-md px-3 text-xs" })}
                  >
                    View profile
                  </Link>
                  <Badge variant={member.role === "LEAD" ? "default" : "outline"} className="rounded-md">
                    {member.role === "LEAD" ? "Lead" : "Teammate"}
                  </Badge>
                </div>
              </div>

              {isLead && implementationId && member.role !== "LEAD" ? (
                <form action={updateMemberRoleFocusAction} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input type="hidden" name="implementationId" value={implementationId} />
                  <input type="hidden" name="memberUserId" value={member.user_id} />
                  <Input
                    name="roleFocus"
                    defaultValue={member.role_focus ?? ""}
                    placeholder="Set focus (Frontend, Backend, Design...)"
                    className="h-9 text-sm"
                  />
                  <button
                    type="submit"
                    className={buttonVariants({ variant: "outline", className: "h-9 px-4 text-sm sm:w-auto" })}
                  >
                    Save focus
                  </button>
                </form>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            No teammates yet. The lead can accept requests to grow this build.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

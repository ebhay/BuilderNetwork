import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ImplementationStatusBadge } from "@/features/implementations/components/implementation-status-badge";
import Image from "next/image";

type ImplementationCardProps = {
  implementation: {
    id: string;
    build_title: string | null;
    github_repo_url: string;
    deployed_url: string | null;
    status: "IN_PROGRESS" | "BUILT";
    target_completion_time: string | null;
    created_at: string;
  };
  commitCount?: number | null;
  ideaTitle?: string;
  leadName?: string;
  leadProfileHref?: string | null;
  membersCount?: number;
  teamAvatars?: Array<{ userId: string; profileImageUrl: string | null; name: string | null }>;
};

export function ImplementationCard({
  implementation,
  ideaTitle,
  leadName,
  leadProfileHref = null,
  membersCount = 0,
  teamAvatars = [],
  commitCount = null,
}: ImplementationCardProps) {
  const statusLabel = implementation.status === "BUILT" ? "Completed" : "In progress";
  const visibleAvatars = teamAvatars.slice(0, 3);
  const extraMembers = Math.max(membersCount - visibleAvatars.length, 0);
  const cardTitle = implementation.build_title?.trim() || ideaTitle || "Untitled build";
  return (
    <Card className="overflow-hidden border-0 shadow-none">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center gap-2">
          <ImplementationStatusBadge status={implementation.status} />
          {commitCount !== null ? (
            <span className="text-xs text-muted-foreground">{commitCount} commits</span>
          ) : null}
        </div>
        <CardTitle className="font-heading text-lg">
          {cardTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>Status: {statusLabel}</p>
        {ideaTitle ? (
          <p>
            Idea: <span className="text-foreground">{ideaTitle}</span>
          </p>
        ) : null}
        <div className="flex items-center justify-between">
          <p>
            Lead:{" "}
            {leadProfileHref ? (
              <Link href={leadProfileHref} className="text-foreground underline-offset-2 hover:underline">
                {leadName ?? "Builder"}
              </Link>
            ) : (
              <span className="text-foreground">{leadName ?? "Builder"}</span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {visibleAvatars.map((member) => (
                <div key={member.userId} className="h-7 w-7 overflow-hidden rounded-full border border-card bg-muted">
                  {member.profileImageUrl ? (
                    <Image src={member.profileImageUrl} alt={member.name ?? "Member"} width={28} height={28} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-ink">
                      {(member.name?.slice(0, 1) ?? "U").toUpperCase()}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span>{extraMembers > 0 ? `+${extraMembers}` : membersCount}</span>
          </div>
        </div>
        <a href={implementation.github_repo_url} className="inline-flex items-center gap-2 text-primary hover:underline" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.23 1.84 1.23 1.07 1.84 2.81 1.3 3.49 1 .11-.78.42-1.3.77-1.6-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.31-.54-1.56.12-3.24 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.68.24 2.93.12 3.24.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.82 1.11.82 2.24v3.32c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
          </svg>
          Open repo
        </a>
        {implementation.deployed_url ? (
          <a href={implementation.deployed_url} className="inline-flex items-center gap-2 text-primary hover:underline" target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M14 3h7v7" />
              <path d="M10 14 21 3" />
              <path d="M21 14v7h-7" />
              <path d="M3 10 14 21" />
            </svg>
            Open build
          </a>
        ) : null}
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Link href={`/implementations/${implementation.id}`} className={buttonVariants({ variant: "outline" })}>
          View build
        </Link>
        <Link href={`/implementations/${implementation.id}`} className={buttonVariants({ variant: "default" })}>
          Join
        </Link>
      </CardFooter>
    </Card>
  );
}

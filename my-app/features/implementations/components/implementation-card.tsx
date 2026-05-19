import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ImplementationStatusBadge } from "@/features/implementations/components/implementation-status-badge";

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
  ideaTitle: string;
};

export function ImplementationCard({ implementation, ideaTitle }: ImplementationCardProps) {
  return (
    <Card className="border border-border">
      <CardHeader className="space-y-2">
        <ImplementationStatusBadge status={implementation.status} />
        <CardTitle className="font-heading text-lg">
          {implementation.build_title || ideaTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <a href={implementation.github_repo_url} className="underline" target="_blank" rel="noreferrer">
          {implementation.github_repo_url}
        </a>
        {implementation.deployed_url ? (
          <a href={implementation.deployed_url} className="block underline" target="_blank" rel="noreferrer">
            {implementation.deployed_url}
          </a>
        ) : null}
        {implementation.target_completion_time ? (
          <p>Target: {implementation.target_completion_time}</p>
        ) : null}
      </CardContent>
      <CardFooter>
        <Link href={`/implementations/${implementation.id}`} className={buttonVariants({ variant: "outline" })}>
          View implementation
        </Link>
      </CardFooter>
    </Card>
  );
}

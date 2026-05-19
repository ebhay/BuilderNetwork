import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { IdeaStatusBadge } from "@/features/ideas/components/idea-status-badge";

type IdeaCardProps = {
  idea: {
    id: string;
    title: string;
    description: string;
    visibility: "PUBLISHED" | "NEEDS_REFINEMENT" | "DRAFT";
    quality_score: number | null;
    project_level: string | null;
    tags: string[];
    required_skills: string[];
    profiles: { name: string | null }[] | null;
    derivedStatus: "IDEA" | "IN_PROGRESS" | "BUILT";
    implementationCount: number;
    builtCount: number;
  };
};

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Card className="border border-border">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <IdeaStatusBadge visibility={idea.visibility} />
          {idea.quality_score !== null ? (
            <Badge variant="outline" className="rounded-md">
              Score {idea.quality_score.toFixed(1)}
            </Badge>
          ) : null}
          {idea.project_level ? (
            <Badge variant="outline" className="rounded-md">
              {idea.project_level}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="font-heading text-xl">{idea.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p className="line-clamp-3">{idea.description}</p>
        <p>By {idea.profiles?.[0]?.name ?? "Unknown builder"}</p>
        <p>
          Status {idea.derivedStatus} · {idea.implementationCount} builds · {idea.builtCount} built
        </p>
        <div className="flex flex-wrap gap-2">
          {idea.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-md">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {idea.required_skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="rounded-md">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3">
        <Link href={`/ideas/${idea.id}`} className={buttonVariants({ variant: "outline" })}>
          View details
        </Link>
        <Link href={`/ideas/${idea.id}`} className={buttonVariants({ variant: "default" })}>
          Start building
        </Link>
      </CardFooter>
    </Card>
  );
}

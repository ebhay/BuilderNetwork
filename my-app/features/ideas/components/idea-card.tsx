import Link from "next/link";
import { ArrowRight, Hammer } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { IdeaStatusBadge } from "@/features/ideas/components/idea-status-badge";
import { displayBuilderName, firstRelation } from "@/lib/supabase/relations";

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
    profiles:
      | { name: string | null; username: string | null }
      | { name: string | null; username: string | null }[]
      | null;
    derivedStatus: "IDEA" | "IN_PROGRESS" | "BUILT";
    implementationCount: number;
    builtCount: number;
  };
};

const TINT_COLORS = [
  "var(--card-tint-sky)",
  "var(--card-tint-peach)",
  "var(--card-tint-rose)",
  "var(--card-tint-mint)",
  "var(--card-tint-lavender)",
];

const getTintStyle = (id: string) => {
  const index =
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % TINT_COLORS.length;
  return TINT_COLORS[index];
};

export function IdeaCard({ idea }: IdeaCardProps) {
  const profile = firstRelation(idea.profiles);
  const builderLabel = displayBuilderName(profile, "Builder");
  const tintColor = getTintStyle(idea.id);
  const overflowCount = Math.max(0, idea.tags.length + idea.required_skills.length - 4);

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="h-2 w-full transition-opacity duration-200 group-hover:opacity-90" style={{ backgroundColor: tintColor }} />

      <CardHeader className="space-y-2 p-4 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <IdeaStatusBadge visibility={idea.visibility} />
          {idea.quality_score !== null ? (
            <Badge variant="secondary" className="rounded-md px-1.5 py-0.5 text-xs font-semibold">
              Score {idea.quality_score.toFixed(1)}
            </Badge>
          ) : null}
          {idea.project_level ? (
            <Badge variant="outline" className="rounded-md px-1.5 py-0.5 text-xs">
              {idea.project_level}
            </Badge>
          ) : null}
        </div>
        <CardTitle className="line-clamp-2 font-heading text-xl font-semibold tracking-tight text-ink transition-colors duration-200 group-hover:text-primary">
          <Link href={`/ideas/${idea.id}`}>{idea.title}</Link>
        </CardTitle>
        <p className="text-xs leading-none text-muted-foreground">
          Proposed by <span className="font-medium text-ink/80">{builderLabel}</span>
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 px-4 pb-4 pt-0 text-sm">
        <p className="line-clamp-2 leading-relaxed text-muted-foreground">{idea.description}</p>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/50 pt-2.5 text-xs text-muted-foreground/90">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            {idea.derivedStatus}
          </span>
          <span>•</span>
          <span>{idea.implementationCount} builds</span>
          <span>•</span>
          <span>{idea.builtCount} built</span>
        </div>

        {(idea.tags.length > 0 || idea.required_skills.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {idea.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-md border-0 bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {tag}
              </Badge>
            ))}
            {idea.required_skills.slice(0, 2).map((skill) => (
              <Badge key={skill} variant="outline" className="rounded-md border-border/70 px-1.5 py-0.5 text-[10px] text-ink/75">
                {skill}
              </Badge>
            ))}
            {overflowCount > 0 ? (
              <Badge variant="outline" className="rounded-md border-border/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{overflowCount}
              </Badge>
            ) : null}
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between gap-2 border-t border-border/40 bg-muted/20 p-3">
        <Link href={`/ideas/${idea.id}`} className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 px-2.5 text-xs hover:bg-muted" })}>
          View Details
        </Link>
        <Link href={`/ideas/${idea.id}`} className={buttonVariants({ variant: "default", size: "sm", className: "h-8 gap-1 px-3 text-xs" })}>
          <Hammer className="h-3.5 w-3.5" />
          Start Building
          <ArrowRight className="h-3 w-3 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}

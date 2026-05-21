import { 
  Sparkles, 
  Layers, 
  ListChecks, 
  Flame, 
  Target, 
  Wrench 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Alternative = { name: string; difference: string };
type ReviewPayload = {
  qualityScore: number;
  qualityBand: string;
  projectLevel: string;
  requiredSkills: string[];
  tags: string[];
  marketAlternatives: Alternative[];
  worthinessReview: string;
  feasibilityReview: string;
  brutalFeedback: string;
  suggestions: string[];
  source?: string;
};

export function ReviewResultPanel({ review }: { review: ReviewPayload }) {
  return (
    <Card className="border border-border/80 bg-card rounded-xl overflow-hidden shadow-sm">
      <CardHeader className="border-b border-border/40 bg-muted/20 px-6 py-4 flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-lg font-semibold tracking-tight text-ink flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Review Analysis
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          {review.source === "mock" ? (
            <Badge variant="outline" className="rounded-md border-amber-250 bg-amber-50 text-amber-800 text-[10px]">
              Local Mock
            </Badge>
          ) : null}
          <Badge className="rounded-md bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5">
            Score: {review.qualityScore.toFixed(1)}/10
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6 text-sm">
        {/* Core Badges Row */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-border/40">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quality Rating</span>
            <Badge variant="outline" className="rounded-md border-border text-ink font-medium px-2 py-1 bg-muted/30">
              {review.qualityBand}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Difficulty Level</span>
            <Badge variant="outline" className="rounded-md border-border text-ink font-medium px-2 py-1 bg-muted/30">
              {review.projectLevel}
            </Badge>
          </div>
        </div>

        {/* Worthiness and Feasibility side-by-side */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 p-4 rounded-xl border border-border/60 bg-muted/10">
            <h3 className="font-heading text-sm font-semibold text-ink flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-600" />
              Worthiness Review
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">{review.worthinessReview}</p>
          </div>
          <div className="space-y-2 p-4 rounded-xl border border-border/60 bg-muted/10">
            <h3 className="font-heading text-sm font-semibold text-ink flex items-center gap-2">
              <Wrench className="h-4 w-4 text-sky-600" />
              Feasibility Review
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">{review.feasibilityReview}</p>
          </div>
        </div>

        {/* Brutal Feedback: Styled like a Warning/Quote Alert */}
        {review.brutalFeedback && (
          <div className="relative overflow-hidden rounded-xl border-l-4 border-rose-500 bg-rose-50/40 p-4 dark:bg-rose-950/20">
            <h3 className="font-heading text-sm font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-2 mb-1.5">
              <Flame className="h-4 w-4 text-rose-600" />
              Brutal Critique
            </h3>
            <p className="text-rose-800/90 dark:text-rose-350 text-xs italic leading-relaxed">
              &ldquo;{review.brutalFeedback}&rdquo;
            </p>
          </div>
        )}

        {/* Alternatives */}
        {review.marketAlternatives && review.marketAlternatives.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-heading text-sm font-semibold text-ink flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet-600" />
              Market Alternatives & Competitors
            </h3>
            <div className="grid gap-2.5">
              {review.marketAlternatives.map((alternative) => (
                <div key={alternative.name} className="p-3 rounded-lg border border-border/50 bg-background text-xs">
                  <span className="font-semibold text-ink">{alternative.name}</span>
                  <p className="text-muted-foreground mt-1 leading-relaxed">{alternative.difference}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {review.suggestions && review.suggestions.length > 0 && (
          <div className="space-y-3 border-t border-border/40 pt-5">
            <h3 className="font-heading text-sm font-semibold text-ink flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-primary" />
              Strategic Recommendations
            </h3>
            <ul className="grid gap-2 text-xs text-muted-foreground">
              {review.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex gap-2 items-start leading-relaxed">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Required Skills & Tags */}
        <div className="grid gap-4 sm:grid-cols-2 border-t border-border/40 pt-5">
          {review.requiredSkills && review.requiredSkills.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Identified Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {review.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="rounded-md px-2 py-0.5 text-xs text-ink/80 border-border/80 bg-background">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {review.tags && review.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Categorization Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {review.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-md px-2 py-0.5 text-xs text-muted-foreground border-0 bg-muted/60">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


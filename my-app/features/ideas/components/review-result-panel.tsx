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
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="font-heading text-xl">AI review result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-md bg-primary text-primary-foreground">
            Score: {review.qualityScore.toFixed(1)}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {review.qualityBand}
          </Badge>
          <Badge variant="outline" className="rounded-md">
            {review.projectLevel}
          </Badge>
          {review.source === "mock" ? (
            <Badge className="rounded-md bg-secondary text-secondary-foreground">Local mock review</Badge>
          ) : null}
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-base">Required skills</h3>
          <div className="flex flex-wrap gap-2">
            {review.requiredSkills.map((skill) => (
              <Badge key={skill} variant="outline" className="rounded-md">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-base">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {review.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-md">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-base">Alternatives</h3>
          <ul className="space-y-2 text-muted-foreground">
            {review.marketAlternatives.map((alternative) => (
              <li key={alternative.name}>
                <span className="font-medium text-foreground">{alternative.name}:</span>{" "}
                {alternative.difference}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-base">Worthiness</h3>
          <p className="text-muted-foreground">{review.worthinessReview}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-base">Feasibility</h3>
          <p className="text-muted-foreground">{review.feasibilityReview}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-base">Feedback</h3>
          <p className="text-muted-foreground">{review.brutalFeedback}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-base">Suggestions</h3>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {review.suggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

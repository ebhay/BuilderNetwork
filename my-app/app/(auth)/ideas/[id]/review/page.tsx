import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { publishIdeaAction } from "@/features/ideas/actions";
import { ReviewResultPanel } from "@/features/ideas/components/review-result-panel";
import { RetryButton } from "@/app/(auth)/ideas/[id]/review/retry-button";
import { AutoProcessReview } from "@/app/(auth)/ideas/[id]/review/auto-process";
import { requireOnboarded, requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function IdeaReviewPage({ params }: Props) {
  const user = await requireUser();
  await requireOnboarded(user.id, "/ideas");
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: idea } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", id)
    .eq("posted_by_user_id", user.id)
    .maybeSingle();

  if (!idea) notFound();

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">{idea.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{idea.description}</p>
          <p>
            Review status: <span className="font-medium text-foreground">{idea.review_status}</span>
          </p>
          {idea.review_error ? <p className="text-destructive">{idea.review_error}</p> : null}
        </CardContent>
      </Card>

      {idea.review_status === "PENDING_REVIEW" ? (
        <Card className="border border-border">
          <CardContent className="flex flex-wrap items-center gap-3 pt-6">
            <AutoProcessReview ideaId={idea.id} />
            <p className="text-muted-foreground">
              AI review is queued or processing. Refresh in a moment.
            </p>
            {idea.review_error ? <RetryButton ideaId={idea.id} /> : null}
          </CardContent>
        </Card>
      ) : null}

      {idea.review_status === "ERROR" ? (
        <Card className="border border-border">
          <CardContent className="flex items-center gap-3 pt-6">
            <RetryButton ideaId={idea.id} />
          </CardContent>
        </Card>
      ) : null}

      {idea.review_status === "REVIEWED" && idea.ai_feedback_json ? (
        <>
          <ReviewResultPanel review={idea.ai_feedback_json} />
          <div className="flex flex-wrap gap-3">
            {(idea.quality_score ?? 0) >= 6 ? (
              <form action={publishIdeaAction}>
                <input type="hidden" name="ideaId" value={idea.id} />
                <input type="hidden" name="mode" value="PUBLISHED" />
                <Button type="submit">Publish idea</Button>
              </form>
            ) : (
              <Card className="w-full border border-border">
                <CardContent className="flex flex-wrap items-center gap-3 pt-6">
                  <p className="text-sm text-muted-foreground">
                    Score is below 6. Keep as draft or explicitly publish as Needs refinement.
                  </p>
                  <form action={publishIdeaAction} className="flex items-center gap-3">
                    <input type="hidden" name="ideaId" value={idea.id} />
                    <input type="hidden" name="mode" value="NEEDS_REFINEMENT" />
                    <input type="hidden" name="confirmNeedsRefinement" value="true" />
                    <Button type="submit" variant="outline">
                      Publish as Needs refinement
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : null}
    </main>
  );
}

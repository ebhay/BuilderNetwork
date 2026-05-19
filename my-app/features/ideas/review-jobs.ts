import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { generateAiReview } from "@/lib/ai/review";

export async function processIdeaReviewJob(ideaId: string) {
  const supabase = createSupabaseServiceClient();

  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .select("id,title,description,content_hash,last_reviewed_hash")
    .eq("id", ideaId)
    .single();

  if (ideaError || !idea) {
    throw new Error("Idea not found for review processing.");
  }

  if (idea.last_reviewed_hash && idea.last_reviewed_hash === idea.content_hash) {
    await supabase
      .from("idea_review_jobs")
      .update({ status: "SUCCEEDED", updated_at: new Date().toISOString() })
      .eq("idea_id", ideaId);
    return;
  }

  await supabase
    .from("idea_review_jobs")
    .update({
      status: "PROCESSING",
      attempts: 1,
      updated_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("idea_id", ideaId);

  try {
    const { review, source } = await generateAiReview({
      title: idea.title,
      description: idea.description,
    });

    await supabase
      .from("ideas")
      .update({
        review_status: "REVIEWED",
        quality_score: review.qualityScore,
        quality_band: review.qualityBand,
        publish_recommendation: review.publishRecommendation,
        project_level: review.projectLevel,
        required_skills: review.requiredSkills,
        tags: review.tags,
        ai_feedback_json: {
          ...review,
          source,
        },
        reviewed_at: new Date().toISOString(),
        review_error: null,
        last_reviewed_hash: idea.content_hash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ideaId);

    await supabase
      .from("idea_review_jobs")
      .update({
        status: "SUCCEEDED",
        updated_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("idea_id", ideaId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown AI review error.";
    await supabase
      .from("ideas")
      .update({
        review_status: "PENDING_REVIEW",
        review_error: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ideaId);

    await supabase
      .from("idea_review_jobs")
      .update({
        status: "FAILED",
        last_error: errorMessage,
        attempts: 1,
        next_attempt_at: new Date(Date.now() + 60_000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("idea_id", ideaId);
  }
}

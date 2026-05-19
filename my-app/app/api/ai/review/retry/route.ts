import { NextResponse } from "next/server";
import { createIdeaContentHash } from "@/lib/ideas/hash";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { processIdeaReviewJob } from "@/features/ideas/review-jobs";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { ideaId?: string };
  if (!body.ideaId) {
    return NextResponse.json({ ok: false, error: "ideaId is required" }, { status: 400 });
  }

  const { data: idea } = await supabase
    .from("ideas")
    .select("id,posted_by_user_id,title,description,screenshot_url,reference_links")
    .eq("id", body.ideaId)
    .single();

  if (!idea || idea.posted_by_user_id !== user.id) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const contentHash = createIdeaContentHash({
    title: idea.title,
    description: idea.description,
    screenshotUrl: idea.screenshot_url,
    referenceLinks: Array.isArray(idea.reference_links) ? idea.reference_links : [],
  });

  await supabase
    .from("ideas")
    .update({
      review_status: "PENDING_REVIEW",
      review_error: null,
      content_hash: contentHash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idea.id);

  await supabase.from("idea_review_jobs").insert({
    idea_id: idea.id,
    status: "QUEUED",
    attempts: 0,
    next_attempt_at: new Date().toISOString(),
  });

  await processIdeaReviewJob(idea.id);
  return NextResponse.json({ ok: true, reviewStatus: "PENDING_REVIEW" });
}

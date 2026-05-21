import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { processIdeaReviewJob } from "@/features/ideas/review-jobs";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { ideaId?: string; limit?: number };
  const limit = Math.min(Math.max(body.limit ?? 1, 1), 5);

  const service = createSupabaseServiceClient();
  let ideaIds: string[] = [];

  if (body.ideaId) {
    const { data: ownedIdea } = await supabase
      .from("ideas")
      .select("id")
      .eq("id", body.ideaId)
      .eq("posted_by_user_id", user.id)
      .maybeSingle();
    if (!ownedIdea) {
      return NextResponse.json({ ok: false, error: "Idea not found" }, { status: 404 });
    }
    ideaIds = [ownedIdea.id];
  } else {
    const { data: queued } = await service
      .from("idea_review_jobs")
      .select("idea_id, ideas!inner(posted_by_user_id)")
      .eq("status", "QUEUED")
      .eq("ideas.posted_by_user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(limit);
    ideaIds = (queued ?? []).map((row) => row.idea_id);
  }

  for (const ideaId of ideaIds) {
    await processIdeaReviewJob(ideaId);
  }

  const targetIdeaId = body.ideaId ?? ideaIds[0] ?? null;
  let reviewStatus: string | null = null;
  let reviewError: string | null = null;
  if (targetIdeaId) {
    const { data: ideaStatus } = await service
      .from("ideas")
      .select("review_status,review_error")
      .eq("id", targetIdeaId)
      .maybeSingle();
    reviewStatus = ideaStatus?.review_status ?? null;
    reviewError = ideaStatus?.review_error ?? null;
  }

  return NextResponse.json({
    ok: true,
    processed: ideaIds.length,
    reviewStatus,
    reviewError,
    ideaId: targetIdeaId,
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createIdeaContentHash } from "@/lib/ideas/hash";
import { requireOnboarded, requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const submitIdeaSchema = z.object({
  title: z.string().trim().min(6).max(140),
  description: z.string().trim().min(30).max(6000),
  screenshotUrl: z.string().trim().url().optional().or(z.literal("")),
  referenceLinks: z.array(z.string().trim().url()),
});

function parseStringArray(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [] as string[];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function submitIdeaAction(formData: FormData) {
  const user = await requireUser("/ideas/submit");
  await requireOnboarded(user.id, "/ideas/submit");

  const input = submitIdeaSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    screenshotUrl: formData.get("screenshotUrl"),
    referenceLinks: parseStringArray(formData.get("referenceLinks")),
  });

  const contentHash = createIdeaContentHash({
    title: input.title,
    description: input.description,
    screenshotUrl: input.screenshotUrl || null,
    referenceLinks: input.referenceLinks,
  });

  const supabase = await createSupabaseServerClient();
  const { data: idea, error } = await supabase
    .from("ideas")
    .insert({
      posted_by_user_id: user.id,
      title: input.title,
      description: input.description,
      screenshot_url: input.screenshotUrl || null,
      reference_links: input.referenceLinks,
      visibility: "DRAFT",
      review_status: "PENDING_REVIEW",
      content_hash: contentHash,
    })
    .select("id")
    .single();

  if (error || !idea) {
    throw new Error("Failed to create idea.");
  }

  const { error: jobError } = await supabase.from("idea_review_jobs").insert({
    idea_id: idea.id,
    status: "QUEUED",
    attempts: 0,
    next_attempt_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (jobError) throw new Error(jobError.message);

  revalidatePath("/ideas");
  redirect(`/ideas/${idea.id}/review`);
}

const publishSchema = z.object({
  ideaId: z.string().uuid(),
  mode: z.enum(["PUBLISHED", "NEEDS_REFINEMENT"]),
  confirmNeedsRefinement: z.boolean().optional(),
});

const rereviewSchema = z.object({
  ideaId: z.string().uuid(),
  title: z.string().trim().min(6).max(140),
  description: z.string().trim().min(30).max(6000),
  screenshotUrl: z.string().trim().url().optional().or(z.literal("")),
  referenceLinks: z.array(z.string().trim().url()),
});

export async function publishIdeaAction(formData: FormData) {
  const user = await requireUser();
  const input = publishSchema.parse({
    ideaId: formData.get("ideaId"),
    mode: formData.get("mode"),
    confirmNeedsRefinement: formData.get("confirmNeedsRefinement") === "true",
  });
  const supabase = await createSupabaseServerClient();

  const { data: idea, error: ideaQueryError } = await supabase
    .from("ideas")
    .select("id,posted_by_user_id,quality_score")
    .eq("id", input.ideaId)
    .single();
  if (ideaQueryError) throw new Error(ideaQueryError.message);

  if (!idea || idea.posted_by_user_id !== user.id) {
    throw new Error("Unauthorized publish request.");
  }

  const score = idea.quality_score ?? 0;
  if (input.mode === "PUBLISHED" && score < 6) {
    throw new Error("Low-score idea cannot be published as PUBLISHED.");
  }

  if (input.mode === "NEEDS_REFINEMENT" && !input.confirmNeedsRefinement) {
    throw new Error("Confirmation required to publish as NEEDS_REFINEMENT.");
  }

  const { error: updateError } = await supabase
    .from("ideas")
    .update({
      visibility: input.mode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.ideaId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/ideas/${input.ideaId}`);
  revalidatePath("/ideas");
  redirect(`/ideas/${input.ideaId}`);
}

export async function updateIdeaForRereviewAction(formData: FormData) {
  const user = await requireUser();
  await requireOnboarded(user.id, "/ideas");

  const input = rereviewSchema.parse({
    ideaId: formData.get("ideaId"),
    title: formData.get("title"),
    description: formData.get("description"),
    screenshotUrl: formData.get("screenshotUrl"),
    referenceLinks: parseStringArray(formData.get("referenceLinks")),
  });

  const supabase = await createSupabaseServerClient();
  const { data: idea, error: fetchError } = await supabase
    .from("ideas")
    .select("id,posted_by_user_id,visibility")
    .eq("id", input.ideaId)
    .single();

  if (fetchError) throw new Error(fetchError.message);
  if (!idea || idea.posted_by_user_id !== user.id) {
    throw new Error("Unauthorized update request.");
  }
  if (idea.visibility !== "DRAFT") {
    throw new Error("You can edit and re-review only while the idea is still a draft.");
  }

  const contentHash = createIdeaContentHash({
    title: input.title,
    description: input.description,
    screenshotUrl: input.screenshotUrl || null,
    referenceLinks: input.referenceLinks,
  });

  const { error: updateError } = await supabase
    .from("ideas")
    .update({
      title: input.title,
      description: input.description,
      screenshot_url: input.screenshotUrl || null,
      reference_links: input.referenceLinks,
      content_hash: contentHash,
      review_status: "PENDING_REVIEW",
      review_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.ideaId);
  if (updateError) throw new Error(updateError.message);

  const jobPayload = {
    status: "QUEUED" as const,
    attempts: 0,
    next_attempt_at: new Date().toISOString(),
    last_error: null,
    updated_at: new Date().toISOString(),
  };
  const { data: existingJob } = await supabase
    .from("idea_review_jobs")
    .select("id")
    .eq("idea_id", input.ideaId)
    .maybeSingle();
  if (existingJob) {
    const { error: jobUpdateError } = await supabase
      .from("idea_review_jobs")
      .update(jobPayload)
      .eq("idea_id", input.ideaId);
    if (jobUpdateError) throw new Error(jobUpdateError.message);
  } else {
    const { error: jobInsertError } = await supabase.from("idea_review_jobs").insert({
      idea_id: input.ideaId,
      ...jobPayload,
    });
    if (jobInsertError) throw new Error(jobInsertError.message);
  }

  revalidatePath(`/ideas/${input.ideaId}/review`);
  revalidatePath(`/ideas/${input.ideaId}`);
  revalidatePath("/ideas");
  redirect(`/ideas/${input.ideaId}/review`);
}

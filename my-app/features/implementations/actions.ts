"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOnboarded, requireUser } from "@/lib/auth/session";
import { deployedUrlSchema, githubUrlSchema } from "@/lib/validation";

const startImplementationSchema = z.object({
  ideaId: z.string().uuid(),
  githubRepoUrl: githubUrlSchema,
  buildTitle: z.string().trim().max(140).optional().or(z.literal("")),
  buildNote: z.string().trim().max(500).optional().or(z.literal("")),
  targetCompletionTime: z.string().trim().max(120).optional().or(z.literal("")),
});

export async function startImplementationAction(formData: FormData) {
  const user = await requireUser();
  await requireOnboarded(user.id, "/ideas");
  const supabase = await createSupabaseServerClient();

  const input = startImplementationSchema.parse({
    ideaId: formData.get("ideaId"),
    githubRepoUrl: formData.get("githubRepoUrl"),
    buildTitle: formData.get("buildTitle"),
    buildNote: formData.get("buildNote"),
    targetCompletionTime: formData.get("targetCompletionTime"),
  });

  const { data: idea } = await supabase
    .from("ideas")
    .select("id, posted_by_user_id, visibility, title")
    .eq("id", input.ideaId)
    .in("visibility", ["PUBLISHED", "NEEDS_REFINEMENT"])
    .maybeSingle();

  if (!idea) {
    throw new Error("Cannot start implementation for non-public idea.");
  }

  const { data: implementation, error: implError } = await supabase
    .from("implementations")
    .insert({
      idea_id: input.ideaId,
      lead_user_id: user.id,
      build_title: input.buildTitle || null,
      build_note: input.buildNote || null,
      github_repo_url: input.githubRepoUrl,
      target_completion_time: input.targetCompletionTime || null,
      credit_to_idea_giver: true,
      status: "IN_PROGRESS",
    })
    .select("id")
    .single();

  if (implError || !implementation) throw new Error(implError?.message ?? "Failed to start build.");

  const { error: memberError } = await supabase.from("implementation_members").insert({
    implementation_id: implementation.id,
    user_id: user.id,
    role: "LEAD",
  });
  if (memberError) throw new Error(memberError.message);

  revalidatePath("/ideas");
  revalidatePath(`/ideas/${input.ideaId}`);
  revalidatePath(`/implementations/${implementation.id}`);
  redirect(`/implementations/${implementation.id}`);
}

const markBuiltSchema = z.object({
  implementationId: z.string().uuid(),
  deployedUrl: deployedUrlSchema,
});

const updateBuildNoteSchema = z.object({
  implementationId: z.string().uuid(),
  buildNote: z.string().trim().max(1200).optional().or(z.literal("")),
});

const updateBuildRolesSchema = z.object({
  implementationId: z.string().uuid(),
  roles: z.string().trim().max(300).optional().or(z.literal("")),
});

const updateBuildTargetSchema = z.object({
  implementationId: z.string().uuid(),
  targetCompletionTime: z.string().trim().max(120).optional().or(z.literal("")),
});

const updateMemberRoleFocusSchema = z.object({
  implementationId: z.string().uuid(),
  memberUserId: z.string().uuid(),
  roleFocus: z.string().trim().max(80).optional().or(z.literal("")),
});

export async function markImplementationBuiltAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const input = markBuiltSchema.parse({
    implementationId: formData.get("implementationId"),
    deployedUrl: formData.get("deployedUrl"),
  });

  const { data: implementation } = await supabase
    .from("implementations")
    .select("id,lead_user_id,idea_id")
    .eq("id", input.implementationId)
    .single();

  if (!implementation || implementation.lead_user_id !== user.id) {
    throw new Error("Only lead builder can mark implementation as built.");
  }

  const { error } = await supabase
    .from("implementations")
    .update({
      deployed_url: input.deployedUrl,
      status: "BUILT",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.implementationId)
    .eq("lead_user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath(`/ideas/${implementation.idea_id}`);
  revalidatePath(`/implementations/${input.implementationId}`);
  redirect(`/implementations/${input.implementationId}`);
}

export async function updateBuildNoteAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const input = updateBuildNoteSchema.parse({
    implementationId: formData.get("implementationId"),
    buildNote: formData.get("buildNote"),
  });

  const { data: implementation } = await supabase
    .from("implementations")
    .select("id,lead_user_id,idea_id")
    .eq("id", input.implementationId)
    .single();

  if (!implementation || implementation.lead_user_id !== user.id) {
    throw new Error("Only lead builder can edit build notes.");
  }

  const { error } = await supabase
    .from("implementations")
    .update({
      build_note: input.buildNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.implementationId)
    .eq("lead_user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath(`/ideas/${implementation.idea_id}`);
  revalidatePath(`/implementations/${input.implementationId}`);
  redirect(`/implementations/${input.implementationId}`);
}

export async function updateBuildRolesAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const input = updateBuildRolesSchema.parse({
    implementationId: formData.get("implementationId"),
    roles: formData.get("roles"),
  });

  const { data: implementation } = await supabase
    .from("implementations")
    .select("id,lead_user_id,idea_id")
    .eq("id", input.implementationId)
    .single();

  if (!implementation || implementation.lead_user_id !== user.id) {
    throw new Error("Only lead builder can edit needed roles.");
  }

  const roles = (input.roles ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);

  const { error } = await supabase
    .from("implementations")
    .update({
      needed_roles: roles,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.implementationId)
    .eq("lead_user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath(`/ideas/${implementation.idea_id}`);
  revalidatePath(`/implementations/${input.implementationId}`);
  redirect(`/implementations/${input.implementationId}`);
}

export async function updateBuildTargetAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const input = updateBuildTargetSchema.parse({
    implementationId: formData.get("implementationId"),
    targetCompletionTime: formData.get("targetCompletionTime"),
  });

  const { data: implementation } = await supabase
    .from("implementations")
    .select("id,lead_user_id,idea_id")
    .eq("id", input.implementationId)
    .single();

  if (!implementation || implementation.lead_user_id !== user.id) {
    throw new Error("Only lead builder can edit target completion time.");
  }

  const { error } = await supabase
    .from("implementations")
    .update({
      target_completion_time: input.targetCompletionTime || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.implementationId)
    .eq("lead_user_id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath(`/ideas/${implementation.idea_id}`);
  revalidatePath(`/implementations/${input.implementationId}`);
  redirect(`/implementations/${input.implementationId}`);
}

export async function updateMemberRoleFocusAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const input = updateMemberRoleFocusSchema.parse({
    implementationId: formData.get("implementationId"),
    memberUserId: formData.get("memberUserId"),
    roleFocus: formData.get("roleFocus"),
  });

  const { data: implementation } = await supabase
    .from("implementations")
    .select("id,lead_user_id,idea_id")
    .eq("id", input.implementationId)
    .single();
  if (!implementation || implementation.lead_user_id !== user.id) {
    throw new Error("Only lead builder can edit member roles.");
  }

  const { data: membership } = await supabase
    .from("implementation_members")
    .select("implementation_id,user_id")
    .eq("implementation_id", input.implementationId)
    .eq("user_id", input.memberUserId)
    .maybeSingle();
  if (!membership) throw new Error("Member not found in this implementation.");

  const { error } = await supabase
    .from("implementation_members")
    .update({
      role_focus: input.roleFocus || null,
    })
    .eq("implementation_id", input.implementationId)
    .eq("user_id", input.memberUserId);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath(`/ideas/${implementation.idea_id}`);
  revalidatePath(`/implementations/${input.implementationId}`);
}

const toggleSavedSchema = z.object({
  ideaId: z.string().uuid(),
});

export async function toggleSavedIdeaAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const input = toggleSavedSchema.parse({
    ideaId: formData.get("ideaId"),
  });

  const { data: existing } = await supabase
    .from("saved_ideas")
    .select("id")
    .eq("idea_id", input.ideaId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_ideas").delete().eq("id", existing.id);
  } else {
    await supabase.from("saved_ideas").insert({
      idea_id: input.ideaId,
      user_id: user.id,
    });
  }

  revalidatePath(`/ideas/${input.ideaId}`);
  revalidatePath("/dashboard");
}

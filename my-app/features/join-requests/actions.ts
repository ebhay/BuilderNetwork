"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { firstRelation } from "@/lib/supabase/relations";

const sendJoinRequestSchema = z.object({
  implementationId: z.string().uuid(),
  message: z.string().trim().max(500).optional().or(z.literal("")),
});

const respondJoinRequestSchema = z.object({
  joinRequestId: z.string().uuid(),
  decision: z.enum(["ACCEPT", "REJECT"]),
});

type JoinRequestActionState = {
  ok: boolean;
  message: string;
};

export async function sendJoinRequestAction(
  _prevState: JoinRequestActionState,
  formData: FormData,
): Promise<JoinRequestActionState> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const input = sendJoinRequestSchema.parse({
    implementationId: formData.get("implementationId"),
    message: formData.get("message"),
  });

  const { data: implementation } = await supabase
    .from("implementations")
    .select("id,lead_user_id,idea_id,ideas!inner(visibility)")
    .eq("id", input.implementationId)
    .in("ideas.visibility", ["PUBLISHED", "NEEDS_REFINEMENT"])
    .maybeSingle();

  if (!implementation) {
    return { ok: false, message: "Implementation is not available for join requests." };
  }
  if (implementation.lead_user_id === user.id) {
    return { ok: false, message: "Lead builder cannot send a join request." };
  }

  const { data: member } = await supabase
    .from("implementation_members")
    .select("id")
    .eq("implementation_id", input.implementationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (member) {
    return { ok: false, message: "You are already a member of this build." };
  }

  const { data: pending } = await supabase
    .from("join_requests")
    .select("id")
    .eq("implementation_id", input.implementationId)
    .eq("requester_user_id", user.id)
    .eq("status", "PENDING")
    .maybeSingle();

  if (pending) {
    return { ok: false, message: "A pending join request already exists." };
  }

  const { error } = await supabase.from("join_requests").insert({
    implementation_id: input.implementationId,
    requester_user_id: user.id,
    message: input.message || null,
    status: "PENDING",
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/implementations/${input.implementationId}`);
  revalidatePath("/dashboard");
  return { ok: true, message: "Join request sent." };
}

export async function respondJoinRequestAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const input = respondJoinRequestSchema.parse({
    joinRequestId: formData.get("joinRequestId"),
    decision: formData.get("decision"),
  });

  const { data: request } = await supabase
    .from("join_requests")
    .select("id,implementation_id,requester_user_id,status,implementations!inner(id,lead_user_id)")
    .eq("id", input.joinRequestId)
    .maybeSingle();

  if (!request) {
    throw new Error("Join request not found.");
  }

  const implementation = firstRelation(
    request.implementations as { id: string; lead_user_id: string }[] | { id: string; lead_user_id: string } | null,
  );
  if (!implementation || implementation.lead_user_id !== user.id) {
    throw new Error("Only the implementation lead can manage this request.");
  }

  if (request.status !== "PENDING") {
    revalidatePath("/dashboard");
    revalidatePath(`/implementations/${request.implementation_id}`);
    return;
  }

  const nextStatus = input.decision === "ACCEPT" ? "ACCEPTED" : "REJECTED";
  const { error: updateError } = await supabase
    .from("join_requests")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", request.id)
    .eq("status", "PENDING");

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (nextStatus === "ACCEPTED") {
    const { data: existingMember } = await supabase
      .from("implementation_members")
      .select("id")
      .eq("implementation_id", request.implementation_id)
      .eq("user_id", request.requester_user_id)
      .maybeSingle();

    const { error: memberError } = existingMember
      ? { error: null }
      : await supabase.from("implementation_members").insert({
          implementation_id: request.implementation_id,
          user_id: request.requester_user_id,
          role: "TEAMMATE",
        });

    if (memberError) {
      throw new Error(memberError.message);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath(`/implementations/${request.implementation_id}`);
}

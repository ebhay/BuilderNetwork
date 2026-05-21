"use client";

import { useActionState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { sendJoinRequestAction } from "@/features/join-requests/actions";

const initialState = { ok: false, message: "" };

export function JoinRequestForm({ implementationId }: { implementationId: string }) {
  const [state, action, pending] = useActionState(sendJoinRequestAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="implementationId" value={implementationId} />
      <Textarea
        name="message"
        maxLength={500}
        placeholder="Tell the build lead how you want to help. Keep it short and specific."
        className="min-h-24"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Request to join this build"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-destructive"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}

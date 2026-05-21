"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  updateBuildNoteAction,
  updateBuildRolesAction,
  updateBuildTargetAction,
} from "@/features/implementations/actions";

type Props = {
  implementationId: string;
  buildNote: string;
  neededRoles: string[];
  targetCompletionTime: string;
};

function normalizeRole(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function LeadBuildControls({ implementationId, buildNote, neededRoles, targetCompletionTime }: Props) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(buildNote);
  const [roleDraft, setRoleDraft] = useState("");
  const [roles, setRoles] = useState<string[]>(neededRoles);
  const [targetDraft, setTargetDraft] = useState(targetCompletionTime);
  const [pending, startTransition] = useTransition();

  const rolesValue = useMemo(() => roles.join(","), [roles]);

  function addRole(raw?: string) {
    const value = normalizeRole(raw ?? roleDraft);
    if (!value) return;
    setRoles((prev) => {
      if (prev.some((item) => item.toLowerCase() === value.toLowerCase())) return prev;
      return [...prev, value].slice(0, 10);
    });
    setRoleDraft("");
  }

  function removeRole(role: string) {
    setRoles((prev) => prev.filter((item) => item.toLowerCase() !== role.toLowerCase()));
  }

  async function saveNote() {
    const formData = new FormData();
    formData.set("implementationId", implementationId);
    formData.set("buildNote", noteDraft);
    startTransition(async () => {
      await updateBuildNoteAction(formData);
    });
  }

  async function saveRoles() {
    const formData = new FormData();
    formData.set("implementationId", implementationId);
    formData.set("roles", rolesValue);
    startTransition(async () => {
      await updateBuildRolesAction(formData);
    });
  }

  async function saveTarget() {
    const formData = new FormData();
    formData.set("implementationId", implementationId);
    formData.set("targetCompletionTime", targetDraft);
    startTransition(async () => {
      await updateBuildTargetAction(formData);
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-background p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">Build note (lead only)</p>
          {!isEditingNote ? (
            <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={() => setIsEditingNote(true)}>
              Edit
            </Button>
          ) : null}
        </div>

        {isEditingNote ? (
          <div className="space-y-3">
            <Textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              rows={4}
              maxLength={1200}
              placeholder="Add execution notes, blockers, and what is already working..."
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={saveNote} disabled={pending}>
                Save build note
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-3 text-xs"
                onClick={() => {
                  setIsEditingNote(false);
                  setNoteDraft(buildNote);
                }}
                disabled={pending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
            {buildNote.trim() ? buildNote : "The build lead has not added a build note yet."}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-background p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Target completion (lead only)</p>
        <div className="flex items-center gap-2">
          <Input
            value={targetDraft}
            onChange={(event) => setTargetDraft(event.target.value)}
            placeholder="e.g. 3 weeks / Jun 30, 2026"
          />
          <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={saveTarget} disabled={pending}>
            Save
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Open roles (lead only)</p>
        <Input
          value={roleDraft}
          onChange={(event) => setRoleDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addRole();
            }
          }}
          placeholder="Type role and press Enter (e.g. Frontend)"
        />
        <p className="mt-2 text-xs text-muted-foreground">Press Enter to add each role.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {roles.length > 0 ? (
            roles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => removeRole(role)}
                className="rounded-md border border-border bg-card px-2 py-1 text-xs text-ink"
                title="Remove role"
              >
                {role} ×
              </button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No roles added yet.</p>
          )}
        </div>
        <Button type="button" variant="outline" className="mt-3 h-8 px-3 text-xs" onClick={saveRoles} disabled={pending}>
          Save roles
        </Button>
      </div>
    </div>
  );
}

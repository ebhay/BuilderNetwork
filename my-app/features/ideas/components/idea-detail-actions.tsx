"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { startImplementationAction, toggleSavedIdeaAction } from "@/features/implementations/actions";

export function IdeaDetailActions({
  ideaId,
  isSaved,
  className,
}: {
  ideaId: string;
  isSaved: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`flex gap-2 ${className ?? ""}`}>
        <form action={toggleSavedIdeaAction} className="flex-1">
          <input type="hidden" name="ideaId" value={ideaId} />
          <Button type="submit" variant="outline" className="w-full">
            {isSaved ? "Unsave idea" : "Save idea"}
          </Button>
        </form>
        <Button type="button" className="flex-1" onClick={() => setOpen(true)}>
          Start implementation
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-xl">Start implementation</h3>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            <form action={startImplementationAction} className="space-y-4">
              <input type="hidden" name="ideaId" value={ideaId} />
              <div className="space-y-2">
                <Label htmlFor="githubRepoUrl">GitHub repository URL</Label>
                <Input id="githubRepoUrl" name="githubRepoUrl" type="url" required placeholder="https://github.com/owner/repo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildTitle">Build title (optional)</Label>
                <Input id="buildTitle" name="buildTitle" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buildNote">Build note (optional)</Label>
                <Textarea id="buildNote" name="buildNote" rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetCompletionTime">Target completion time (optional)</Label>
                <Input id="targetCompletionTime" name="targetCompletionTime" placeholder="e.g. 3 weeks" />
              </div>
              <Button type="submit" className="w-full">Start implementation</Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

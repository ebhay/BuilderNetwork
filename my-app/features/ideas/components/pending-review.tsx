"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEP_LABELS = [
  "AI submission",
  "Request ID generated",
  "Model call started",
  "Waiting for response",
  "Fallback check (if needed)",
  "Still processing response",
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function PendingReview({ ideaId }: { ideaId: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      // Do not advance to fake completion; hold near final waiting state until server status changes.
      const index = clamp(Math.floor(elapsed / 3000), 0, STEP_LABELS.length - 1);
      setStepIndex(index);
    }, 400);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleReviewProcess(event: Event) {
      const custom = event as CustomEvent<{
        ideaId?: string | null;
        reviewStatus?: string | null;
      }>;
      if (custom.detail?.ideaId !== ideaId) return;
      if (custom.detail?.reviewStatus === "REVIEWED") {
        setStepIndex(STEP_LABELS.length - 1);
        setCompleted(true);
      }
    }

    window.addEventListener("idea-review-process", handleReviewProcess);
    return () => window.removeEventListener("idea-review-process", handleReviewProcess);
  }, [ideaId]);

  const progress = useMemo(() => {
    if (completed) return 100;
    return clamp(Math.round(((stepIndex + 1) / STEP_LABELS.length) * 100), 8, 92);
  }, [completed, stepIndex]);

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Review in progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-foreground">AI review pipeline is running.</p>
        </div>

        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-md bg-muted">
            <div
              className="h-full rounded-md bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs font-medium text-primary">
            {stepIndex >= STEP_LABELS.length - 1
              ? "Processing response... waiting for model output"
              : `${progress}% complete`}
          </p>
        </div>

        <div className="space-y-2 rounded-md border border-border/70 bg-muted/20 p-3">
          {STEP_LABELS.map((label, idx) => {
            const active = !completed && idx === stepIndex;
            return (
              <div key={label} className="flex items-center gap-2 text-xs">
                {active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-border/80" />
                )}
                <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-start gap-2 rounded-md border border-amber-300/50 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs">
            Stay on this page until review completes. We auto-refresh every few seconds.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">Request ID: {ideaId}</p>
      </CardContent>
    </Card>
  );
}

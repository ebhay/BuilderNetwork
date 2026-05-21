"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function AutoProcessReview({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function callProcess() {
      try {
        const response = await fetch("/api/ai/review/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ideaId, limit: 1 }),
        });
        const payload = await response.json().catch(() => null);
        // Runtime visibility for debugging provider and pipeline behavior.
        console.log("[review-process]", payload);
        window.dispatchEvent(
          new CustomEvent("idea-review-process", {
            detail: payload,
          }),
        );
      } catch (error) {
        console.error("[review-process-error]", error);
      }
    }

    void callProcess();

    const id = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => {
      clearInterval(id);
    }
  }, [ideaId, router]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoProcessReview({ ideaId }: { ideaId: string }) {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;

    async function tick() {
      await fetch("/api/ai/review/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId, limit: 1 }),
      });
      if (!stopped) {
        router.refresh();
      }
    }

    void tick();
    const id = setInterval(() => void tick(), 5000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [ideaId, router]);

  return null;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RetryButton({ ideaId }: { ideaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onRetry() {
    setLoading(true);
    await fetch("/api/ai/review/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideaId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" onClick={onRetry} disabled={loading}>
      {loading ? "Retrying..." : "Retry AI review"}
    </Button>
  );
}

"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">We couldn&apos;t load your dashboard. Please try again.</p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

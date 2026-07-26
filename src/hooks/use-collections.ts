"use client";

import { useEffect, useState } from "react";

import { listCollections } from "@/actions/collections";
import type { CollectionOption } from "@/lib/db/collections";

export function useCollections(enabled: boolean) {
  const [result, setResult] = useState<CollectionOption[] | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    listCollections().then((response) => {
      if (cancelled) return;
      setResult(response.success ? response.data : []);
    });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { collections: result ?? [], loading: enabled && result === null };
}

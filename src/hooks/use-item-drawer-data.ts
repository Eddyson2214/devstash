"use client";

import { useEffect, useState } from "react";

import type { ItemDetail } from "@/lib/db/items";

export type FetchedItemDetail = Omit<ItemDetail, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export function useItemDrawerData(itemId: string | null, open: boolean) {
  const [result, setResult] = useState<{ id: string; detail: FetchedItemDetail | null } | null>(
    null
  );

  useEffect(() => {
    if (!open || !itemId) return;

    let cancelled = false;

    fetch(`/api/items/${itemId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: FetchedItemDetail | null) => {
        if (!cancelled) setResult({ id: itemId, detail: data });
      });

    return () => {
      cancelled = true;
    };
  }, [open, itemId]);

  const loading = itemId !== null && result?.id !== itemId;
  const item = result?.id === itemId ? result.detail : null;

  function setItem(detail: FetchedItemDetail) {
    if (!itemId) return;
    setResult({ id: itemId, detail });
  }

  return { item, loading, setItem };
}

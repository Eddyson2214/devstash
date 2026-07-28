"use client";

import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";

import type { FavoriteCollection } from "@/lib/db/collections";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface FavoriteCollectionRowProps {
  collection: FavoriteCollection;
}

export function FavoriteCollectionRow({ collection }: FavoriteCollectionRowProps) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/collections/${collection.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/collections/${collection.id}`);
        }
      }}
      className="flex cursor-pointer items-center gap-3 px-2 py-1.5 font-mono text-sm hover:bg-muted/50"
    >
      <Layers className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{collection.name}</span>
      <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
        {collection.itemCount} item{collection.itemCount === 1 ? "" : "s"}
      </span>
      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {formatDate(collection.updatedAt)}
      </span>
    </div>
  );
}

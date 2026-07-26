import type { ReactNode } from "react";

import { CollectionCard } from "@/components/collections/CollectionCard";
import type { RecentCollection } from "@/lib/db/collections";

interface CollectionGridProps {
  collections: RecentCollection[];
  emptyMessage: string;
  emptyAction?: ReactNode;
}

export function CollectionGrid({ collections, emptyMessage, emptyAction }: CollectionGridProps) {
  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}

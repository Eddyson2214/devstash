import Link from "next/link";

import { CollectionCard } from "@/components/collections/CollectionCard";
import type { RecentCollection } from "@/lib/db/collections";

interface RecentCollectionsProps {
  recentCollections: RecentCollection[];
}

export function RecentCollections({ recentCollections }: RecentCollectionsProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Collections</h3>
        <Link href="/collections" className="text-sm text-muted-foreground hover:underline">
          View all collections
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {recentCollections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}

        {recentCollections.length === 0 && (
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        )}
      </div>
    </section>
  );
}

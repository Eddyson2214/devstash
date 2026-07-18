import Link from "next/link";
import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { RecentCollection } from "@/lib/db/collections";
import { TYPE_ICONS } from "@/lib/type-icons";

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
          <Card
            key={collection.id}
            className="gap-3 border-l-4"
            style={{ borderLeftColor: collection.accentColor ?? undefined }}
          >
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 font-medium">
                  <span>{collection.name}</span>
                  {collection.isFavorite && (
                    <Star
                      className="size-3.5 fill-amber-400 text-amber-400"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {collection.itemCount} items
                </span>
              </div>

              <p className="text-sm text-muted-foreground">{collection.description}</p>

              <div className="flex gap-2">
                {collection.itemTypes.map((type) => {
                  const Icon = TYPE_ICONS[type.icon];
                  return (
                    <Icon
                      key={type.id}
                      className="size-4"
                      style={{ color: type.color }}
                      aria-hidden="true"
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {recentCollections.length === 0 && (
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        )}
      </div>
    </section>
  );
}

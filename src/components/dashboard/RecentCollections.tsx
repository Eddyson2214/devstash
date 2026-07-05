import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getRecentCollections, itemTypes, items } from "@/lib/mock-data";
import { TYPE_ICONS } from "@/lib/type-icons";

const RECENT_COLLECTIONS_LIMIT = 6;

export function RecentCollections() {
  const recentCollections = getRecentCollections(RECENT_COLLECTIONS_LIMIT);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Collections</h3>
        <span className="text-sm text-muted-foreground">View all</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {recentCollections.map((collection) => {
          const itemCount = items.filter((item) => item.collectionIds.includes(collection.id)).length;
          const accentColor = itemTypes.find((type) => type.id === collection.itemTypeIds[0])?.color;

          return (
            <Card key={collection.id} className="gap-3 border-l-4" style={{ borderLeftColor: accentColor }}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>{collection.name}</span>
                    {collection.isFavorite && (
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">{itemCount} items</span>
                </div>

                <p className="text-sm text-muted-foreground">{collection.description}</p>

                <div className="flex gap-2">
                  {collection.itemTypeIds.map((typeId) => {
                    const type = itemTypes.find((t) => t.id === typeId);
                    if (!type) return null;
                    const Icon = TYPE_ICONS[type.icon];
                    return <Icon key={typeId} className="size-4" style={{ color: type.color }} />;
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

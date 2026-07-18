import { Folder, Package, Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { CollectionStats } from "@/lib/db/collections";
import type { ItemStats } from "@/lib/db/items";

interface StatsCardsProps {
  itemStats: ItemStats;
  collectionStats: CollectionStats;
}

export function StatsCards({ itemStats, collectionStats }: StatsCardsProps) {
  const stats = [
    { label: "Items", value: itemStats.total, icon: Package },
    { label: "Collections", value: collectionStats.total, icon: Folder },
    { label: "Favorite Items", value: itemStats.favorites, icon: Star },
    { label: "Favorite Collections", value: collectionStats.favorites, icon: Star },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

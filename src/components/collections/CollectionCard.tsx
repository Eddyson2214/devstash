"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { toggleCollectionFavorite } from "@/actions/collections";
import { CollectionActionsMenu } from "@/components/collections/CollectionActionsMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { RecentCollection } from "@/lib/db/collections";
import { TYPE_ICONS } from "@/lib/type-icons";

interface CollectionCardProps {
  collection: RecentCollection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const router = useRouter();

  async function handleToggleFavorite(event: MouseEvent) {
    event.stopPropagation();

    const response = await toggleCollectionFavorite(collection.id);
    if (!response.success) {
      toast.error(response.error);
      return;
    }

    router.refresh();
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/collections/${collection.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/collections/${collection.id}`);
        }
      }}
      className="cursor-pointer gap-3 border-l-4 transition-colors hover:bg-muted/50"
      style={{ borderLeftColor: collection.accentColor ?? undefined }}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <span>{collection.name}</span>
            <Button variant="ghost" size="icon-sm" onClick={handleToggleFavorite}>
              <Star
                className={
                  collection.isFavorite ? "size-3.5 fill-amber-400 text-amber-400" : "size-3.5"
                }
                aria-hidden="true"
              />
              <span className="sr-only">
                {collection.isFavorite ? "Unfavorite" : "Favorite"} {collection.name}
              </span>
            </Button>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-sm text-muted-foreground">{collection.itemCount} items</span>
            <CollectionActionsMenu collection={collection} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{collection.description}</p>

        <div className="flex gap-2">
          {collection.itemTypes.map((type) => {
            const Icon = TYPE_ICONS[type.icon];
            return (
              <Icon key={type.id} className="size-4" style={{ color: type.color }} aria-hidden="true" />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Pin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import type { DashboardItem } from "@/lib/db/items";
import { TYPE_ICONS } from "@/lib/type-icons";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ItemCardProps {
  item: DashboardItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const Icon = TYPE_ICONS[item.itemType.icon];
  const { openItemDrawer } = useItemDrawer();

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => openItemDrawer(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openItemDrawer(item.id);
        }
      }}
      className="cursor-pointer gap-3 border-l-4 transition-colors hover:bg-muted/50"
      style={{ borderLeftColor: item.itemType.color }}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${item.itemType.color}1a` }}
          >
            {Icon && (
              <Icon className="size-4" style={{ color: item.itemType.color }} aria-hidden="true" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {item.isPinned && <Pin className="size-3.5 text-muted-foreground" aria-hidden="true" />}
            {item.isFavorite && (
              <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            )}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-medium">{item.title}</h3>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          )}
        </div>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
      </CardContent>
    </Card>
  );
}

"use client";

import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Copy, Pin, Star } from "lucide-react";
import { toast } from "sonner";

import { toggleItemFavorite } from "@/actions/items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const copyText = item.content ?? item.url ?? "";

  async function handleCopy(event: MouseEvent) {
    event.stopPropagation();
    if (!copyText) return;

    await navigator.clipboard.writeText(copyText);
    toast.success("Copied to clipboard");
  }

  async function handleToggleFavorite(event: MouseEvent) {
    event.stopPropagation();

    const response = await toggleItemFavorite(item.id);
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
            {copyText && (
              <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
                <Copy className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Copy {item.title}</span>
              </Button>
            )}
            {item.isPinned && <Pin className="size-3.5 text-muted-foreground" aria-hidden="true" />}
            <Button variant="ghost" size="icon-sm" onClick={handleToggleFavorite}>
              <Star
                className={
                  item.isFavorite ? "size-3.5 fill-amber-400 text-amber-400" : "size-3.5"
                }
                aria-hidden="true"
              />
              <span className="sr-only">
                {item.isFavorite ? "Unfavorite" : "Favorite"} {item.title}
              </span>
            </Button>
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

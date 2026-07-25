"use client";

import { ImageIcon, Pin, Star } from "lucide-react";

import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import type { DashboardItem } from "@/lib/db/items";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ImageThumbnailCardProps {
  item: DashboardItem;
}

export function ImageThumbnailCard({ item }: ImageThumbnailCardProps) {
  const { openItemDrawer } = useItemDrawer();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItemDrawer(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openItemDrawer(item.id);
        }
      }}
      className="group cursor-pointer overflow-hidden rounded-lg border border-border/60 bg-card transition-colors hover:bg-muted/50"
    >
      <div className="aspect-video overflow-hidden bg-muted">
        {item.fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote R2 URL, not a local asset
          <img
            src={item.fileUrl}
            alt={item.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {item.isPinned && <Pin className="size-3.5 text-muted-foreground" aria-hidden="true" />}
          {item.isFavorite && (
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}

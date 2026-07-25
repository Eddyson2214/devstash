import type { ReactNode } from "react";

import { ImageThumbnailCard } from "@/components/items/ImageThumbnailCard";
import type { DashboardItem } from "@/lib/db/items";

interface ImageGalleryProps {
  items: DashboardItem[];
  emptyMessage: string;
  emptyAction?: ReactNode;
}

export function ImageGallery({ items, emptyMessage, emptyAction }: ImageGalleryProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ImageThumbnailCard key={item.id} item={item} />
      ))}
    </div>
  );
}

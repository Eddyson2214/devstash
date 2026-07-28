"use client";

import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import type { FavoriteItem } from "@/lib/db/items";
import { TYPE_ICONS } from "@/lib/type-icons";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface FavoriteItemRowProps {
  item: FavoriteItem;
}

export function FavoriteItemRow({ item }: FavoriteItemRowProps) {
  const { openItemDrawer } = useItemDrawer();
  const Icon = TYPE_ICONS[item.itemType.icon];

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
      className="flex cursor-pointer items-center gap-3 px-2 py-1.5 font-mono text-sm hover:bg-muted/50"
    >
      {Icon && (
        <Icon
          className="size-4 shrink-0"
          style={{ color: item.itemType.color }}
          aria-hidden="true"
        />
      )}
      <span className="min-w-0 flex-1 truncate">{item.title}</span>
      <span
        className="shrink-0 rounded-sm px-1.5 py-0.5 text-xs"
        style={{ backgroundColor: `${item.itemType.color}1a`, color: item.itemType.color }}
      >
        {item.itemType.name}
      </span>
      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {formatDate(item.updatedAt)}
      </span>
    </div>
  );
}

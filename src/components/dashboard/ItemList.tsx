import { Pin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { DashboardItem } from "@/lib/db/items";
import { TYPE_ICONS } from "@/lib/type-icons";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface ItemListProps {
  title: string;
  items: DashboardItem[];
  emptyMessage: string;
}

export function ItemList({ title, items: listItems, emptyMessage }: ItemListProps) {
  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <div className="flex flex-col gap-3">
        {listItems.map((item) => {
          const Icon = TYPE_ICONS[item.itemType.icon];

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border-l-4 bg-card p-4 ring-1 ring-foreground/10"
              style={{ borderLeftColor: item.itemType.color }}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${item.itemType.color}1a` }}
              >
                {Icon && <Icon className="size-4" style={{ color: item.itemType.color }} />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-medium">{item.title}</span>
                  {item.isPinned && <Pin className="size-3.5 text-muted-foreground" />}
                  {item.isFavorite && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
                </div>
                {item.description && (
                  <p className="truncate text-sm text-muted-foreground">{item.description}</p>
                )}
                {item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(item.createdAt)}
              </span>
            </div>
          );
        })}

        {listItems.length === 0 && (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </div>
    </section>
  );
}

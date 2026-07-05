import { Pin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { itemTypes, type Item } from "@/lib/mock-data";
import { TYPE_ICONS } from "@/lib/type-icons";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface ItemListProps {
  title: string;
  items: Item[];
  emptyMessage: string;
}

export function ItemList({ title, items: listItems, emptyMessage }: ItemListProps) {
  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <div className="flex flex-col gap-3">
        {listItems.map((item) => {
          const itemType = itemTypes.find((type) => type.id === item.itemTypeId);
          const Icon = itemType ? TYPE_ICONS[itemType.icon] : null;

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border-l-4 bg-card p-4 ring-1 ring-foreground/10"
              style={{ borderLeftColor: itemType?.color }}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: itemType ? `${itemType.color}1a` : undefined }}
              >
                {Icon && <Icon className="size-4" style={{ color: itemType?.color }} />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-medium">{item.title}</span>
                  {item.isPinned && <Pin className="size-3.5 text-muted-foreground" />}
                  {item.isFavorite && <Star className="size-3.5 fill-amber-400 text-amber-400" />}
                </div>
                <p className="truncate text-sm text-muted-foreground">{item.description}</p>
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

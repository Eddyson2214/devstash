import { ItemCard } from "@/components/items/ItemCard";
import type { DashboardItem } from "@/lib/db/items";

interface ItemGridProps {
  items: DashboardItem[];
  emptyMessage: string;
}

export function ItemGrid({ items, emptyMessage }: ItemGridProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

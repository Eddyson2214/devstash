import { Code } from "lucide-react";

import type { ProfileItemTypeBreakdown } from "@/lib/db/profile";
import { TYPE_ICONS } from "@/lib/type-icons";

interface ItemTypeBreakdownProps {
  itemsByType: ProfileItemTypeBreakdown[];
}

export function ItemTypeBreakdown({ itemsByType }: ItemTypeBreakdownProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {itemsByType.map((type) => {
        const Icon = TYPE_ICONS[type.icon] ?? Code;

        return (
          <li
            key={type.id}
            className="flex items-center gap-2.5 rounded-md border p-3"
          >
            <Icon className="size-4 shrink-0" style={{ color: type.color }} aria-hidden="true" />
            <span className="flex-1 truncate text-sm">{type.name}</span>
            <span className="text-sm font-medium text-muted-foreground">{type.count}</span>
          </li>
        );
      })}
    </ul>
  );
}

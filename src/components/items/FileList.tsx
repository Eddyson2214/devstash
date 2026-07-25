import type { ReactNode } from "react";

import { FileListRow } from "@/components/items/FileListRow";
import type { DashboardItem } from "@/lib/db/items";

interface FileListProps {
  items: DashboardItem[];
  emptyMessage: string;
  emptyAction?: ReactNode;
}

export function FileList({ items, emptyMessage, emptyAction }: FileListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-border/60">
      {items.map((item) => (
        <FileListRow key={item.id} item={item} />
      ))}
    </div>
  );
}

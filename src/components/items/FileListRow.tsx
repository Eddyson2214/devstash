"use client";

import { Download } from "lucide-react";

import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { Button } from "@/components/ui/button";
import type { DashboardItem } from "@/lib/db/items";
import { FILE_ICON_BY_CATEGORY, getFileIconCategory } from "@/lib/file-icon";
import { formatFileSize } from "@/lib/file-upload";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface FileListRowProps {
  item: DashboardItem;
}

export function FileListRow({ item }: FileListRowProps) {
  const { openItemDrawer } = useItemDrawer();
  const iconCategory = getFileIconCategory(item.fileName);
  const Icon = FILE_ICON_BY_CATEGORY[iconCategory];

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
      className="flex cursor-pointer flex-col gap-2 border-b border-border/60 px-3 py-3 transition-colors last:border-b-0 hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{item.title}</p>
          {item.fileName && (
            <p className="truncate text-xs text-muted-foreground">{item.fileName}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pl-12 sm:justify-end sm:gap-6 sm:pl-0">
        <span className="text-xs text-muted-foreground sm:w-16 sm:text-right">
          {item.fileSize !== null ? formatFileSize(item.fileSize) : "—"}
        </span>
        <span className="text-xs text-muted-foreground sm:w-24 sm:text-right">
          {formatDate(item.createdAt)}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={<a href={`/api/download/${item.id}`} download={item.fileName ?? true} />}
          onClick={(event) => event.stopPropagation()}
        >
          <Download aria-hidden="true" />
          <span className="sr-only">Download {item.title}</span>
        </Button>
      </div>
    </div>
  );
}

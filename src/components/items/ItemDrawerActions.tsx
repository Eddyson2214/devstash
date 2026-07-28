"use client";

import { Copy, Download, Pencil, Pin, Star, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { FetchedItemDetail } from "@/hooks/use-item-drawer-data";
import { TYPE_ICONS } from "@/lib/type-icons";

interface ItemDrawerActionsProps {
  item: FetchedItemDetail;
  editing: boolean;
  canSave: boolean;
  saving: boolean;
  deleting: boolean;
  confirmingDelete: boolean;
  onConfirmingDeleteChange: (open: boolean) => void;
  showsFile: boolean;
  copyText: string;
  onCopy: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  togglingFavorite: boolean;
  onTogglePin: () => void;
  togglingPin: boolean;
}

export function ItemDrawerActions({
  item,
  editing,
  canSave,
  saving,
  deleting,
  confirmingDelete,
  onConfirmingDeleteChange,
  showsFile,
  copyText,
  onCopy,
  onSave,
  onCancelEdit,
  onStartEdit,
  onDelete,
  onToggleFavorite,
  togglingFavorite,
  onTogglePin,
  togglingPin,
}: ItemDrawerActionsProps) {
  const Icon = TYPE_ICONS[item.itemType.icon];

  return (
    <SheetHeader className="gap-3 border-b p-4">
      <div className="flex items-center gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${item.itemType.color}1a` }}
        >
          {Icon && <Icon className="size-5" style={{ color: item.itemType.color }} aria-hidden="true" />}
        </div>
        <SheetTitle className="text-lg">{item.title}</SheetTitle>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="secondary">{item.itemType.name}</Badge>
        {item.language && <Badge variant="secondary">{item.language}</Badge>}
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onSave} disabled={saving || !canSave}>
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancelEdit} disabled={saving}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onToggleFavorite} disabled={togglingFavorite}>
            <Star
              className={item.isFavorite ? "fill-amber-400 text-amber-400" : ""}
              aria-hidden="true"
            />
            Favorite
          </Button>
          <Button variant="ghost" size="sm" onClick={onTogglePin} disabled={togglingPin}>
            <Pin
              className={item.isPinned ? "fill-foreground" : ""}
              aria-hidden="true"
            />
            Pin
          </Button>
          <Button variant="ghost" size="sm" onClick={onCopy} disabled={!copyText}>
            <Copy aria-hidden="true" />
            Copy
          </Button>
          {showsFile && item.fileUrl && (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<a href={`/api/download/${item.id}`} download={item.fileName ?? true} />}
            >
              <Download aria-hidden="true" />
              Download
            </Button>
          )}
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onStartEdit}>
              <Pencil aria-hidden="true" />
              Edit
            </Button>
            <AlertDialog open={confirmingDelete} onOpenChange={onConfirmingDeleteChange}>
              <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
                <Trash2 className="text-destructive" aria-hidden="true" />
                <span className="sr-only">Delete</span>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes &ldquo;{item.title}&rdquo;. This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" disabled={deleting} onClick={onDelete}>
                    {deleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </SheetHeader>
  );
}

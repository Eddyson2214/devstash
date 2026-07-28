"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { toggleCollectionFavorite } from "@/actions/collections";
import { DeleteCollectionDialog } from "@/components/collections/DeleteCollectionDialog";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { Button } from "@/components/ui/button";
import type { RecentCollection } from "@/lib/db/collections";

interface CollectionDetailActionsProps {
  collection: RecentCollection;
}

export function CollectionDetailActions({ collection }: CollectionDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  function handleUpdated() {
    router.refresh();
  }

  function handleDeleted() {
    router.push("/collections");
  }

  async function handleToggleFavorite() {
    setTogglingFavorite(true);
    const response = await toggleCollectionFavorite(collection.id);
    setTogglingFavorite(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleFavorite}
        disabled={togglingFavorite}
      >
        <Star
          className={collection.isFavorite ? "fill-amber-400 text-amber-400" : ""}
          aria-hidden="true"
        />
        Favorite
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
        <Pencil aria-hidden="true" />
        Edit
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
        <Trash2 className="text-destructive" aria-hidden="true" />
        Delete
      </Button>

      <EditCollectionDialog
        collection={collection}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={handleUpdated}
      />
      <DeleteCollectionDialog
        collection={collection}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

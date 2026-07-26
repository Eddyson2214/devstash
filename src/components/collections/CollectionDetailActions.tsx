"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";

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

  function handleUpdated() {
    router.refresh();
  }

  function handleDeleted() {
    router.push("/collections");
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" disabled title="Coming soon">
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

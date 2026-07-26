"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { CollectionOption } from "@/lib/db/collections";

interface CollectionCheckboxListProps {
  idPrefix: string;
  collections: CollectionOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
}

export function CollectionCheckboxList({
  idPrefix,
  collections,
  selectedIds,
  onChange,
  loading = false,
}: CollectionCheckboxListProps) {
  function toggle(collectionId: string, checked: boolean) {
    onChange(
      checked ? [...selectedIds, collectionId] : selectedIds.filter((id) => id !== collectionId)
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Collections</Label>
      <div className="flex max-h-32 flex-col gap-2 overflow-y-auto rounded-md border p-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading collections...</p>
        ) : collections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collections yet.</p>
        ) : (
          collections.map((collection) => {
            const checkboxId = `${idPrefix}-collection-${collection.id}`;
            return (
              <div key={collection.id} className="flex items-center gap-2">
                <Checkbox
                  id={checkboxId}
                  checked={selectedIds.includes(collection.id)}
                  onCheckedChange={(checked) => toggle(collection.id, checked === true)}
                />
                <Label htmlFor={checkboxId} className="text-sm font-normal">
                  {collection.name}
                </Label>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

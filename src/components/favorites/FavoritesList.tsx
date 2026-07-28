"use client";

import { useState } from "react";

import { FavoriteCollectionRow } from "@/components/favorites/FavoriteCollectionRow";
import { FavoriteItemRow } from "@/components/favorites/FavoriteItemRow";
import { FavoritesSection } from "@/components/favorites/FavoritesSection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FavoriteCollection } from "@/lib/db/collections";
import type { FavoriteItem } from "@/lib/db/items";
import {
  FAVORITE_SORT_OPTIONS,
  sortFavoriteCollections,
  sortFavoriteItems,
  type FavoriteSortOption,
} from "@/lib/sort-favorites";

const SORT_LABELS: Record<FavoriteSortOption, string> = {
  date: "Date",
  name: "Name",
  type: "Item Type",
};

interface FavoritesListProps {
  favoriteItems: FavoriteItem[];
  favoriteCollections: FavoriteCollection[];
}

export function FavoritesList({ favoriteItems, favoriteCollections }: FavoritesListProps) {
  const [sortBy, setSortBy] = useState<FavoriteSortOption>("date");

  const sortedItems = sortFavoriteItems(favoriteItems, sortBy);
  const sortedCollections = sortFavoriteCollections(favoriteCollections, sortBy);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">Sort by</span>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as FavoriteSortOption)}>
          <SelectTrigger className="w-36" size="sm" aria-label="Sort favorites">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FAVORITE_SORT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {SORT_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FavoritesSection title="Items" count={sortedItems.length} emptyMessage="No favorite items yet.">
        {sortedItems.map((item) => (
          <FavoriteItemRow key={item.id} item={item} />
        ))}
      </FavoritesSection>

      <FavoritesSection
        title="Collections"
        count={sortedCollections.length}
        emptyMessage="No favorite collections yet."
      >
        {sortedCollections.map((collection) => (
          <FavoriteCollectionRow key={collection.id} collection={collection} />
        ))}
      </FavoritesSection>
    </>
  );
}

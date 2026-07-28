export const FAVORITE_SORT_OPTIONS = ["date", "name", "type"] as const;

export type FavoriteSortOption = (typeof FAVORITE_SORT_OPTIONS)[number];

export function sortFavoriteItems<T extends { title: string; updatedAt: Date; itemType: { name: string } }>(
  items: T[],
  sortBy: FavoriteSortOption
): T[] {
  const sorted = [...items];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "type":
      return sorted.sort((a, b) => a.itemType.name.localeCompare(b.itemType.name));
    case "date":
      return sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }
}

export function sortFavoriteCollections<T extends { name: string; updatedAt: Date }>(
  collections: T[],
  sortBy: FavoriteSortOption
): T[] {
  switch (sortBy) {
    case "name":
      return [...collections].sort((a, b) => a.name.localeCompare(b.name));
    case "date":
      return [...collections].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    case "type":
      return collections;
  }
}

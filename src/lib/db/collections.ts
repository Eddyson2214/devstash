import { prisma } from "@/lib/prisma";

// Stand-in until auth sessions are wired up; single demo user for now.
const DEMO_USER_EMAIL = "demo@devstash.io";

export interface CollectionItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface RecentCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  itemTypes: CollectionItemType[];
  accentColor: string | null;
  createdAt: Date;
}

export interface CollectionStats {
  total: number;
  favorites: number;
}

interface CollectionWithItems {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  createdAt: Date;
  items: { item: { itemType: CollectionItemType } }[];
}

function toRecentCollection(collection: CollectionWithItems): RecentCollection {
  const typeCounts = new Map<string, { count: number; type: CollectionItemType }>();

  for (const { item } of collection.items) {
    const existing = typeCounts.get(item.itemType.id);
    if (existing) {
      existing.count += 1;
    } else {
      typeCounts.set(item.itemType.id, { count: 1, type: item.itemType });
    }
  }

  const sortedTypes = [...typeCounts.values()].sort((a, b) => b.count - a.count);

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    itemCount: collection.items.length,
    itemTypes: sortedTypes.map((entry) => entry.type),
    accentColor: sortedTypes[0]?.type.color ?? null,
    createdAt: collection.createdAt,
  };
}

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
  return user?.id ?? null;
}

export async function getRecentCollections(limit: number): Promise<RecentCollection[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
  });

  return collections.map(toRecentCollection);
}

export async function getFavoriteCollections(): Promise<RecentCollection[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
  });

  return collections.map(toRecentCollection);
}

export async function getCollectionStats(): Promise<CollectionStats> {
  const userId = await getDemoUserId();
  if (!userId) return { total: 0, favorites: 0 };

  const [total, favorites] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { total, favorites };
}

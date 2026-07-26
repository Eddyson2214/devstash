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

export interface CollectionOption {
  id: string;
  name: string;
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

export async function getAllCollections(userId: string): Promise<CollectionOption[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getCollectionsForUser(userId: string): Promise<RecentCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
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

export async function getCollectionById(
  id: string,
  userId: string
): Promise<RecentCollection | null> {
  const collection = await prisma.collection.findFirst({
    where: { id, userId },
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

  return collection ? toRecentCollection(collection) : null;
}

export interface CreateCollectionData {
  name: string;
  description: string | null;
}

export interface CreatedCollection {
  id: string;
  name: string;
  description: string | null;
}

export async function createCollection(
  userId: string,
  data: CreateCollectionData
): Promise<CreatedCollection> {
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      description: data.description,
      userId,
    },
  });

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
  };
}

export interface SearchableCollection {
  id: string;
  name: string;
  itemCount: number;
}

export async function getSearchableCollections(userId: string): Promise<SearchableCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, _count: { select: { items: true } } },
  });

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    itemCount: collection._count.items,
  }));
}

export interface UpdateCollectionData {
  name: string;
  description: string | null;
}

export async function updateCollection(
  id: string,
  userId: string,
  data: UpdateCollectionData
): Promise<CreatedCollection | null> {
  const existing = await prisma.collection.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const collection = await prisma.collection.update({
    where: { id },
    data: { name: data.name, description: data.description },
  });

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
  };
}

export async function deleteCollection(id: string, userId: string): Promise<boolean> {
  const result = await prisma.collection.deleteMany({ where: { id, userId } });
  return result.count > 0;
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

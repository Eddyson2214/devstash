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

export async function getRecentCollections(limit: number): Promise<RecentCollection[]> {
  const user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
  if (!user) return [];

  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
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

  return collections.map((collection) => {
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
  });
}

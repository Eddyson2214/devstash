import { prisma } from "@/lib/prisma";

export interface ProfileUser {
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
  hasPassword: boolean;
}

export async function getProfileUser(userId: string): Promise<ProfileUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, image: true, createdAt: true, password: true },
  });

  if (!user) return null;

  return {
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: Boolean(user.password),
  };
}

export interface ProfileItemTypeBreakdown {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface ProfileStats {
  totalItems: number;
  totalCollections: number;
  itemsByType: ProfileItemTypeBreakdown[];
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [totalItems, totalCollections, itemTypes, counts] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({ where: { isSystem: true }, orderBy: { id: "asc" } }),
    prisma.item.groupBy({ by: ["itemTypeId"], where: { userId }, _count: { _all: true } }),
  ]);

  const countByTypeId = new Map(counts.map((entry) => [entry.itemTypeId, entry._count._all]));

  return {
    totalItems,
    totalCollections,
    itemsByType: itemTypes.map((type) => ({
      id: type.id,
      name: type.name,
      icon: type.icon,
      color: type.color,
      count: countByTypeId.get(type.id) ?? 0,
    })),
  };
}

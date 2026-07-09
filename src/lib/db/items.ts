import { prisma } from "@/lib/prisma";

// Stand-in until auth sessions are wired up; single demo user for now.
const DEMO_USER_EMAIL = "demo@devstash.io";

export interface DashboardItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  itemType: DashboardItemType;
  tags: string[];
}

export interface ItemStats {
  total: number;
  favorites: number;
}

async function getDemoUser() {
  return prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
}

function toDashboardItem(item: {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  itemType: DashboardItemType;
  tags: { name: string }[];
}): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    itemType: item.itemType,
    tags: item.tags.map((tag) => tag.name),
  };
}

export async function getPinnedItems(): Promise<DashboardItem[]> {
  const user = await getDemoUser();
  if (!user) return [];

  const items = await prisma.item.findMany({
    where: { userId: user.id, isPinned: true },
    orderBy: { createdAt: "desc" },
    include: { itemType: true, tags: true },
  });

  return items.map(toDashboardItem);
}

export async function getRecentItems(limit: number): Promise<DashboardItem[]> {
  const user = await getDemoUser();
  if (!user) return [];

  const items = await prisma.item.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { itemType: true, tags: true },
  });

  return items.map(toDashboardItem);
}

export async function getItemStats(): Promise<ItemStats> {
  const user = await getDemoUser();
  if (!user) return { total: 0, favorites: 0 };

  const [total, favorites] = await Promise.all([
    prisma.item.count({ where: { userId: user.id } }),
    prisma.item.count({ where: { userId: user.id, isFavorite: true } }),
  ]);

  return { total, favorites };
}

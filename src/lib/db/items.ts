import type { ContentType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { typeHref } from "@/lib/type-icons";

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
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
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

export interface ItemTypeWithCount {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  contentType: string;
  url: string | null;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemType: DashboardItemType;
  tags: string[];
  collections: { id: string; name: string }[];
}

async function getDemoUser() {
  return prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
}

function toDashboardItem(item: {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
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
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
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

export async function getItemTypeBySlug(slug: string): Promise<DashboardItemType | null> {
  const itemTypes = await prisma.itemType.findMany({ where: { isSystem: true } });
  const itemType = itemTypes.find((type) => typeHref(type.name) === `/items/${slug}`);

  return itemType ?? null;
}

export async function getItemsByType(itemTypeId: string): Promise<DashboardItem[]> {
  const user = await getDemoUser();
  if (!user) return [];

  const items = await prisma.item.findMany({
    where: { userId: user.id, itemTypeId },
    orderBy: { createdAt: "desc" },
    include: { itemType: true, tags: true },
  });

  return items.map(toDashboardItem);
}

function toItemDetail(item: {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  contentType: string;
  url: string | null;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemType: DashboardItemType;
  tags: { name: string }[];
  collections: { collection: { id: string; name: string } }[];
}): ItemDetail {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    contentType: item.contentType,
    url: item.url,
    language: item.language,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    itemType: item.itemType,
    tags: item.tags.map((tag) => tag.name),
    collections: item.collections.map(({ collection }) => ({
      id: collection.id,
      name: collection.name,
    })),
  };
}

export async function getItemDetail(id: string, userId: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: { itemType: true, tags: true, collections: { include: { collection: true } } },
  });

  return item ? toItemDetail(item) : null;
}

export interface UpdateItemData {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
}

export async function updateItem(
  id: string,
  userId: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const item = await prisma.item.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        set: [],
        connectOrCreate: data.tags.map((name) => ({ where: { name }, create: { name } })),
      },
    },
    include: { itemType: true, tags: true, collections: { include: { collection: true } } },
  });

  return toItemDetail(item);
}

export interface CreateItemData {
  title: string;
  description: string | null;
  content: string | null;
  contentType: ContentType;
  url: string | null;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  tags: string[];
  itemTypeId: string;
}

export async function createItem(userId: string, data: CreateItemData): Promise<ItemDetail> {
  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      contentType: data.contentType,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      userId,
      itemTypeId: data.itemTypeId,
      tags: {
        connectOrCreate: data.tags.map((name) => ({ where: { name }, create: { name } })),
      },
    },
    include: { itemType: true, tags: true, collections: { include: { collection: true } } },
  });

  return toItemDetail(item);
}

export async function deleteItem(
  id: string,
  userId: string
): Promise<{ fileUrl: string | null } | null> {
  const existing = await prisma.item.findFirst({
    where: { id, userId },
    select: { id: true, fileUrl: true },
  });
  if (!existing) return null;

  await prisma.item.delete({ where: { id: existing.id } });
  return { fileUrl: existing.fileUrl };
}

export async function getItemTypesWithCounts(): Promise<ItemTypeWithCount[]> {
  const user = await getDemoUser();

  const [itemTypes, counts] = await Promise.all([
    prisma.itemType.findMany({ where: { isSystem: true }, orderBy: { id: "asc" } }),
    user
      ? prisma.item.groupBy({ by: ["itemTypeId"], where: { userId: user.id }, _count: { _all: true } })
      : Promise.resolve([]),
  ]);

  const countByTypeId = new Map(counts.map((entry) => [entry.itemTypeId, entry._count._all]));

  return itemTypes.map((type) => ({
    id: type.id,
    name: type.name,
    icon: type.icon,
    color: type.color,
    count: countByTypeId.get(type.id) ?? 0,
  }));
}

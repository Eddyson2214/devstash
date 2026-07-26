import type { ContentType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { typeHref } from "@/lib/type-icons";

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
  content: string | null;
  url: string | null;
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

function toDashboardItem(item: {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
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
    content: item.content,
    url: item.url,
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

export async function getPinnedItems(userId: string): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { createdAt: "desc" },
    include: { itemType: true, tags: true },
  });

  return items.map(toDashboardItem);
}

export async function getRecentItems(userId: string, limit: number): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { itemType: true, tags: true },
  });

  return items.map(toDashboardItem);
}

export async function getItemStats(userId: string): Promise<ItemStats> {
  const [total, favorites] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { total, favorites };
}

export async function getItemTypeBySlug(slug: string): Promise<DashboardItemType | null> {
  const itemTypes = await prisma.itemType.findMany({ where: { isSystem: true } });
  const itemType = itemTypes.find((type) => typeHref(type.name) === `/items/${slug}`);

  return itemType ?? null;
}

export async function getItemsByType(userId: string, itemTypeId: string): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, itemTypeId },
    orderBy: { createdAt: "desc" },
    include: { itemType: true, tags: true },
  });

  return items.map(toDashboardItem);
}

export async function getItemsByCollection(
  userId: string,
  collectionId: string
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, collections: { some: { collectionId } } },
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

async function resolveOwnedCollectionIds(userId: string, collectionIds: string[]): Promise<string[]> {
  if (collectionIds.length === 0) return [];

  const owned = await prisma.collection.findMany({
    where: { id: { in: [...new Set(collectionIds)] }, userId },
    select: { id: true },
  });

  return owned.map((collection) => collection.id);
}

export interface UpdateItemData {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  collectionIds: string[];
}

export async function updateItem(
  id: string,
  userId: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const ownedCollectionIds = await resolveOwnedCollectionIds(userId, data.collectionIds);

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
      collections: {
        deleteMany: {},
        create: ownedCollectionIds.map((collectionId) => ({ collectionId })),
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
  collectionIds: string[];
}

export async function createItem(userId: string, data: CreateItemData): Promise<ItemDetail> {
  const ownedCollectionIds = await resolveOwnedCollectionIds(userId, data.collectionIds);

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
      collections: {
        create: ownedCollectionIds.map((collectionId) => ({ collectionId })),
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

export interface SearchableItem {
  id: string;
  title: string;
  description: string | null;
  itemType: DashboardItemType;
}

export async function getSearchableItems(userId: string): Promise<SearchableItem[]> {
  return prisma.item.findMany({
    where: { userId },
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      itemType: { select: { id: true, name: true, icon: true, color: true } },
    },
  });
}

export async function getItemTypesWithCounts(userId: string): Promise<ItemTypeWithCount[]> {
  const [itemTypes, counts] = await Promise.all([
    prisma.itemType.findMany({ where: { isSystem: true }, orderBy: { id: "asc" } }),
    prisma.item.groupBy({ by: ["itemTypeId"], where: { userId }, _count: { _all: true } }),
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

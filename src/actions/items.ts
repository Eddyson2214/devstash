"use server";

import { z } from "zod";

import { auth } from "@/auth";
import {
  createItem as createItemQuery,
  deleteItem as deleteItemQuery,
  getItemTypeBySlug,
  updateItem as updateItemQuery,
  type ItemDetail,
} from "@/lib/db/items";
import { deleteFromR2, keyFromFileUrl } from "@/lib/r2";

const CREATABLE_ITEM_TYPES = [
  "snippet",
  "prompt",
  "command",
  "note",
  "link",
  "file",
  "image",
] as const;
const FILE_ITEM_TYPES = new Set(["file", "image"]);

const createItemSchema = z
  .object({
    type: z.enum(CREATABLE_ITEM_TYPES),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1).nullable(),
    content: z.string().min(1).nullable(),
    url: z.string().trim().url("Enter a valid URL").nullable(),
    language: z.string().trim().min(1).nullable(),
    fileUrl: z.string().trim().url().nullable(),
    fileName: z.string().trim().min(1).nullable(),
    fileSize: z.number().int().positive().nullable(),
    tags: z.array(z.string().trim().min(1)),
  })
  .refine((data) => data.type !== "link" || data.url !== null, {
    message: "URL is required",
    path: ["url"],
  })
  .refine((data) => !FILE_ITEM_TYPES.has(data.type) || data.fileUrl !== null, {
    message: "A file is required",
    path: ["fileUrl"],
  });

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type CreatableItemType = CreateItemInput["type"];

export async function createItem(
  data: CreateItemInput
): Promise<{ success: true; data: ItemDetail } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = createItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const itemType = await getItemTypeBySlug(`${parsed.data.type}s`);
  if (!itemType) {
    return { success: false, error: "Invalid item type" };
  }

  const created = await createItemQuery(session.user.id, {
    title: parsed.data.title,
    description: parsed.data.description,
    content: parsed.data.content,
    contentType: parsed.data.type === "link" ? "URL" : FILE_ITEM_TYPES.has(parsed.data.type) ? "FILE" : "TEXT",
    url: parsed.data.url,
    language: parsed.data.language,
    fileUrl: parsed.data.fileUrl,
    fileName: parsed.data.fileName,
    fileSize: parsed.data.fileSize,
    tags: parsed.data.tags,
    itemTypeId: itemType.id,
  });

  return { success: true, data: created };
}

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1).nullable(),
  content: z.string().min(1).nullable(),
  url: z.string().trim().url("Enter a valid URL").nullable(),
  language: z.string().trim().min(1).nullable(),
  tags: z.array(z.string().trim().min(1)),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export async function updateItem(
  itemId: string,
  data: UpdateItemInput
): Promise<{ success: true; data: ItemDetail } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = updateItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const updated = await updateItemQuery(itemId, session.user.id, parsed.data);
  if (!updated) {
    return { success: false, error: "Item not found" };
  }

  return { success: true, data: updated };
}

export async function deleteItem(
  itemId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const deleted = await deleteItemQuery(itemId, session.user.id);
  if (!deleted) {
    return { success: false, error: "Item not found" };
  }

  if (deleted.fileUrl) {
    await deleteFromR2(keyFromFileUrl(deleted.fileUrl));
  }

  return { success: true };
}

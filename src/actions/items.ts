"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { updateItem as updateItemQuery, type ItemDetail } from "@/lib/db/items";

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

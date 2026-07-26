"use server";

import { z } from "zod";

import { auth } from "@/auth";
import {
  createCollection as createCollectionQuery,
  type CreatedCollection,
} from "@/lib/db/collections";

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1).nullable(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

export async function createCollection(
  data: CreateCollectionInput
): Promise<{ success: true; data: CreatedCollection } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = createCollectionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const created = await createCollectionQuery(session.user.id, parsed.data);

  return { success: true, data: created };
}

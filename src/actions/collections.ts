"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { countCollectionsForUser } from "@/lib/db/billing";
import {
  createCollection as createCollectionQuery,
  deleteCollection as deleteCollectionQuery,
  getAllCollections,
  toggleCollectionFavorite as toggleCollectionFavoriteQuery,
  updateCollection as updateCollectionQuery,
  type CollectionOption,
  type CreatedCollection,
} from "@/lib/db/collections";
import { FREE_COLLECTION_LIMIT, hasReachedCollectionLimit, isLimitEnforcementEnabled } from "@/lib/limits";

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

  if (isLimitEnforcementEnabled() && !session.user.isPro) {
    const collectionCount = await countCollectionsForUser(session.user.id);
    if (hasReachedCollectionLimit(collectionCount, session.user.isPro)) {
      return {
        success: false,
        error: `Free plan is limited to ${FREE_COLLECTION_LIMIT} collections. Upgrade to Pro for unlimited collections.`,
      };
    }
  }

  const parsed = createCollectionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const created = await createCollectionQuery(session.user.id, parsed.data);

  return { success: true, data: created };
}

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1).nullable(),
});

export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;

export async function updateCollection(
  id: string,
  data: UpdateCollectionInput
): Promise<{ success: true; data: CreatedCollection } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = updateCollectionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const updated = await updateCollectionQuery(id, session.user.id, parsed.data);
  if (!updated) {
    return { success: false, error: "Collection not found" };
  }

  return { success: true, data: updated };
}

export async function deleteCollection(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const deleted = await deleteCollectionQuery(id, session.user.id);
  if (!deleted) {
    return { success: false, error: "Collection not found" };
  }

  return { success: true };
}

export async function toggleCollectionFavorite(
  id: string
): Promise<{ success: true; isFavorite: boolean } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const isFavorite = await toggleCollectionFavoriteQuery(id, session.user.id);
  if (isFavorite === null) {
    return { success: false, error: "Collection not found" };
  }

  return { success: true, isFavorite };
}

export async function listCollections(): Promise<
  { success: true; data: CollectionOption[] } | { success: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const collections = await getAllCollections(session.user.id);

  return { success: true, data: collections };
}

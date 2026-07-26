"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { updateEditorPreferences as updateEditorPreferencesQuery } from "@/lib/db/settings";
import {
  EDITOR_FONT_SIZES,
  EDITOR_TAB_SIZES,
  EDITOR_THEMES,
  type EditorPreferences,
} from "@/lib/editor-preferences";

const updateEditorPreferencesSchema = z.object({
  fontSize: z.number().refine((size) => (EDITOR_FONT_SIZES as readonly number[]).includes(size), {
    message: "Invalid font size",
  }),
  tabSize: z.number().refine((size) => (EDITOR_TAB_SIZES as readonly number[]).includes(size), {
    message: "Invalid tab size",
  }),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(EDITOR_THEMES),
});

export async function updateEditorPreferences(
  preferences: EditorPreferences
): Promise<{ success: true; data: EditorPreferences } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = updateEditorPreferencesSchema.safeParse(preferences);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const updated = await updateEditorPreferencesQuery(
    session.user.id,
    parsed.data as EditorPreferences
  );
  return { success: true, data: updated };
}

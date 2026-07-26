import { prisma } from "@/lib/prisma";
import { DEFAULT_EDITOR_PREFERENCES, type EditorPreferences } from "@/lib/editor-preferences";

export async function getEditorPreferences(userId: string): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  });

  const stored = user?.editorPreferences as Partial<EditorPreferences> | null | undefined;

  return {
    ...DEFAULT_EDITOR_PREFERENCES,
    ...stored,
  };
}

export async function updateEditorPreferences(
  userId: string,
  preferences: EditorPreferences
): Promise<EditorPreferences> {
  await prisma.user.update({
    where: { id: userId },
    data: { editorPreferences: { ...preferences } },
  });

  return preferences;
}

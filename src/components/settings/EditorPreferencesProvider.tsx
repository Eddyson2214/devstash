"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { updateEditorPreferences } from "@/actions/settings";
import { DEFAULT_EDITOR_PREFERENCES, type EditorPreferences } from "@/lib/editor-preferences";

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  updatePreference: <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K]
  ) => void;
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue | null>(null);

export function useEditorPreferences() {
  const context = useContext(EditorPreferencesContext);
  if (!context) {
    throw new Error("useEditorPreferences must be used within an EditorPreferencesProvider");
  }
  return context;
}

export function EditorPreferencesProvider({
  initialPreferences,
  children,
}: {
  initialPreferences: EditorPreferences;
  children: ReactNode;
}) {
  const [preferences, setPreferences] = useState(initialPreferences ?? DEFAULT_EDITOR_PREFERENCES);

  const updatePreference = useCallback(
    <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => {
      const next = { ...preferences, [key]: value };
      setPreferences(next);

      updateEditorPreferences(next).then((result) => {
        if (result.success) {
          toast.success("Editor preferences saved");
        } else {
          setPreferences(preferences);
          toast.error(result.error);
        }
      });
    },
    [preferences]
  );

  return (
    <EditorPreferencesContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

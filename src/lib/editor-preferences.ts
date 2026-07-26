export const EDITOR_THEMES = ["vs-dark", "monokai", "github-dark"] as const;
export type EditorTheme = (typeof EDITOR_THEMES)[number];

export const EDITOR_FONT_SIZES = [12, 13, 14, 16, 18, 20] as const;
export type EditorFontSize = (typeof EDITOR_FONT_SIZES)[number];

export const EDITOR_TAB_SIZES = [2, 4, 8] as const;
export type EditorTabSize = (typeof EDITOR_TAB_SIZES)[number];

export interface EditorPreferences {
  fontSize: EditorFontSize;
  tabSize: EditorTabSize;
  wordWrap: boolean;
  minimap: boolean;
  theme: EditorTheme;
}

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 4,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};

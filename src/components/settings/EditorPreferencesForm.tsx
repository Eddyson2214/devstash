"use client";

import { useEditorPreferences } from "@/components/settings/EditorPreferencesProvider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  EDITOR_FONT_SIZES,
  EDITOR_TAB_SIZES,
  EDITOR_THEMES,
  type EditorFontSize,
  type EditorTabSize,
  type EditorTheme,
} from "@/lib/editor-preferences";

const THEME_LABELS: Record<EditorTheme, string> = {
  "vs-dark": "VS Dark",
  monokai: "Monokai",
  "github-dark": "GitHub Dark",
};

export function EditorPreferencesForm() {
  const { preferences, updatePreference } = useEditorPreferences();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="editor-font-size">Font Size</Label>
          <Select
            value={String(preferences.fontSize)}
            onValueChange={(value) =>
              updatePreference("fontSize", Number(value) as EditorFontSize)
            }
          >
            <SelectTrigger id="editor-font-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITOR_FONT_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="editor-tab-size">Tab Size</Label>
          <Select
            value={String(preferences.tabSize)}
            onValueChange={(value) => updatePreference("tabSize", Number(value) as EditorTabSize)}
          >
            <SelectTrigger id="editor-tab-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITOR_TAB_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} spaces
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="editor-theme">Theme</Label>
        <Select
          value={preferences.theme}
          onValueChange={(value) => updatePreference("theme", value as EditorTheme)}
        >
          <SelectTrigger id="editor-theme" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EDITOR_THEMES.map((theme) => (
              <SelectItem key={theme} value={theme}>
                {THEME_LABELS[theme]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="editor-word-wrap">Word Wrap</Label>
        <Switch
          id="editor-word-wrap"
          checked={preferences.wordWrap}
          onCheckedChange={(checked) => updatePreference("wordWrap", checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="editor-minimap">Minimap</Label>
        <Switch
          id="editor-minimap"
          checked={preferences.minimap}
          onCheckedChange={(checked) => updatePreference("minimap", checked)}
        />
      </div>
    </div>
  );
}

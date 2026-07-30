"use client";

import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGE_SELECT_OPTIONS } from "@/lib/monaco-language";

interface ItemContentFieldsProps {
  showsContent: boolean;
  showsLanguage: boolean;
  content: string;
  onContentChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  languageInputId: string;
  isPromptType?: boolean;
  title?: string;
  isPro?: boolean;
}

export function ItemContentFields({
  showsContent,
  showsLanguage,
  content,
  onContentChange,
  language,
  onLanguageChange,
  languageInputId,
  isPromptType = false,
  title = "",
  isPro = false,
}: ItemContentFieldsProps) {
  const matchedLanguageOption = LANGUAGE_SELECT_OPTIONS.find(
    (option) => option.value.toLowerCase() === language.toLowerCase()
  );

  return (
    <>
      {showsLanguage && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={languageInputId}>Language</Label>
          <Select
            value={matchedLanguageOption?.value ?? language}
            onValueChange={(value) => onLanguageChange(value ?? "")}
          >
            <SelectTrigger id={languageInputId} className="w-full">
              <SelectValue>
                {() => matchedLanguageOption?.label || language || "Plain Text"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_SELECT_OPTIONS.map((option) => (
                <SelectItem key={option.value || "plaintext"} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showsContent && (
        <div className="flex flex-col gap-1.5">
          <Label>Content</Label>
          {showsLanguage ? (
            <CodeEditor value={content} onChange={onContentChange} language={language || null} />
          ) : (
            <MarkdownEditor
              value={content}
              onChange={onContentChange}
              optimize={isPromptType ? { title, isPro } : undefined}
            />
          )}
        </div>
      )}
    </>
  );
}

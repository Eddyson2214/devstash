"use client";

import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ItemContentFieldsProps {
  showsContent: boolean;
  showsLanguage: boolean;
  content: string;
  onContentChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  languageInputId: string;
}

export function ItemContentFields({
  showsContent,
  showsLanguage,
  content,
  onContentChange,
  language,
  onLanguageChange,
  languageInputId,
}: ItemContentFieldsProps) {
  return (
    <>
      {showsContent && (
        <div className="flex flex-col gap-1.5">
          {showsLanguage ? (
            <>
              <Label>Content</Label>
              <CodeEditor value={content} onChange={onContentChange} language={language || null} />
            </>
          ) : (
            <>
              <Label>Content</Label>
              <MarkdownEditor value={content} onChange={onContentChange} />
            </>
          )}
        </div>
      )}

      {showsLanguage && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={languageInputId}>Language</Label>
          <Input
            id={languageInputId}
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
          />
        </div>
      )}
    </>
  );
}

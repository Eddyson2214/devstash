"use client";

import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface EditFormState {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tagsInput: string;
}

interface ItemEditFormProps {
  form: EditFormState;
  onChange: (form: EditFormState) => void;
  showsContent: boolean;
  showsLanguage: boolean;
  showsUrl: boolean;
}

export function ItemEditForm({ form, onChange, showsContent, showsLanguage, showsUrl }: ItemEditFormProps) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="item-title">Title</Label>
        <Input
          id="item-title"
          value={form.title}
          onChange={(event) => onChange({ ...form, title: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="item-description">Description</Label>
        <Textarea
          id="item-description"
          value={form.description}
          onChange={(event) => onChange({ ...form, description: event.target.value })}
        />
      </div>

      {showsContent && (
        <div className="flex flex-col gap-1.5">
          {showsLanguage ? (
            <>
              <Label>Content</Label>
              <CodeEditor
                value={form.content}
                onChange={(next) => onChange({ ...form, content: next })}
                language={form.language || null}
              />
            </>
          ) : (
            <>
              <Label>Content</Label>
              <MarkdownEditor
                value={form.content}
                onChange={(next) => onChange({ ...form, content: next })}
              />
            </>
          )}
        </div>
      )}

      {showsLanguage && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item-language">Language</Label>
          <Input
            id="item-language"
            value={form.language}
            onChange={(event) => onChange({ ...form, language: event.target.value })}
          />
        </div>
      )}

      {showsUrl && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item-url">URL</Label>
          <Input
            id="item-url"
            type="url"
            value={form.url}
            onChange={(event) => onChange({ ...form, url: event.target.value })}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="item-tags">Tags</Label>
        <Input
          id="item-tags"
          placeholder="Comma-separated"
          value={form.tagsInput}
          onChange={(event) => onChange({ ...form, tagsInput: event.target.value })}
        />
      </div>
    </>
  );
}

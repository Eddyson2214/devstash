"use client";

import { CollectionCheckboxList } from "@/components/items/CollectionCheckboxList";
import { ItemContentFields } from "@/components/items/ItemContentFields";
import { SuggestDescriptionButton } from "@/components/items/SuggestDescriptionButton";
import { SuggestTagsButton } from "@/components/items/SuggestTagsButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CollectionOption } from "@/lib/db/collections";
import { appendTag } from "@/lib/tags";

export interface EditFormState {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tagsInput: string;
  collectionIds: string[];
}

interface ItemEditFormProps {
  form: EditFormState;
  onChange: (form: EditFormState) => void;
  showsContent: boolean;
  showsLanguage: boolean;
  showsUrl: boolean;
  fileName?: string | null;
  collections: CollectionOption[];
  collectionsLoading: boolean;
  isPro?: boolean;
}

export function ItemEditForm({
  form,
  onChange,
  showsContent,
  showsLanguage,
  showsUrl,
  fileName,
  collections,
  collectionsLoading,
  isPro = false,
}: ItemEditFormProps) {
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
        {isPro && (
          <SuggestDescriptionButton
            title={form.title}
            content={form.content}
            url={form.url}
            fileName={fileName ?? undefined}
            onSuggest={(description) => onChange({ ...form, description })}
          />
        )}
      </div>

      <ItemContentFields
        showsContent={showsContent}
        showsLanguage={showsLanguage}
        content={form.content}
        onContentChange={(next) => onChange({ ...form, content: next })}
        language={form.language}
        onLanguageChange={(next) => onChange({ ...form, language: next })}
        languageInputId="item-language"
      />

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

      <CollectionCheckboxList
        idPrefix="item-edit"
        collections={collections}
        selectedIds={form.collectionIds}
        onChange={(collectionIds) => onChange({ ...form, collectionIds })}
        loading={collectionsLoading}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="item-tags">Tags</Label>
        <Input
          id="item-tags"
          placeholder="Comma-separated"
          value={form.tagsInput}
          onChange={(event) => onChange({ ...form, tagsInput: event.target.value })}
        />
        {isPro && (
          <SuggestTagsButton
            title={form.title}
            content={form.content}
            tagsInput={form.tagsInput}
            onAcceptTag={(tag) => onChange({ ...form, tagsInput: appendTag(form.tagsInput, tag) })}
          />
        )}
      </div>
    </>
  );
}

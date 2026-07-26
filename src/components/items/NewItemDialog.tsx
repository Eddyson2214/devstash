"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { createItem, type CreatableItemType } from "@/actions/items";
import { CollectionCheckboxList } from "@/components/items/CollectionCheckboxList";
import { FileUpload, type UploadedFile } from "@/components/items/FileUpload";
import { ItemContentFields } from "@/components/items/ItemContentFields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCollections } from "@/hooks/use-collections";
import { TYPE_ICONS } from "@/lib/type-icons";

interface ItemTypeOption {
  value: CreatableItemType;
  label: string;
  icon: LucideIcon;
  color: string;
}

const ITEM_TYPE_OPTIONS: ItemTypeOption[] = [
  { value: "snippet", label: "Snippet", icon: TYPE_ICONS.Code, color: "#3b82f6" },
  { value: "prompt", label: "Prompt", icon: TYPE_ICONS.Sparkles, color: "#8b5cf6" },
  { value: "command", label: "Command", icon: TYPE_ICONS.Terminal, color: "#f97316" },
  { value: "note", label: "Note", icon: TYPE_ICONS.StickyNote, color: "#fde047" },
  { value: "file", label: "File", icon: TYPE_ICONS.File, color: "#6b7280" },
  { value: "image", label: "Image", icon: TYPE_ICONS.Image, color: "#ec4899" },
  { value: "link", label: "Link", icon: TYPE_ICONS.Link, color: "#10b981" },
];

const CONTENT_TYPES = new Set<CreatableItemType>(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPES = new Set<CreatableItemType>(["snippet", "command"]);
const URL_TYPES = new Set<CreatableItemType>(["link"]);
const FILE_TYPES = new Set<CreatableItemType>(["file", "image"]);

interface FormState {
  type: CreatableItemType;
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  file: UploadedFile | null;
  tagsInput: string;
  collectionIds: string[];
}

function emptyForm(defaultType: CreatableItemType): FormState {
  return {
    type: defaultType,
    title: "",
    description: "",
    content: "",
    url: "",
    language: "",
    file: null,
    tagsInput: "",
    collectionIds: [],
  };
}

interface NewItemDialogProps {
  defaultType?: CreatableItemType;
  triggerLabel?: string;
}

export function NewItemDialog({
  defaultType = "snippet",
  triggerLabel = "New Item",
}: NewItemDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm(defaultType));
  const { collections, loading: collectionsLoading } = useCollections(open);

  const showsContent = CONTENT_TYPES.has(form.type);
  const showsLanguage = LANGUAGE_TYPES.has(form.type);
  const showsUrl = URL_TYPES.has(form.type);
  const showsFile = FILE_TYPES.has(form.type);
  const canSubmit =
    form.title.trim().length > 0 &&
    (!showsUrl || form.url.trim().length > 0) &&
    (!showsFile || form.file !== null);

  function handleOpenChange(next: boolean) {
    if (next) setForm(emptyForm(defaultType));
    setOpen(next);
  }

  async function handleCreate() {
    setCreating(true);

    const tags = form.tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const response = await createItem({
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim() || null,
      content: showsContent ? form.content || null : null,
      url: showsUrl ? form.url.trim() || null : null,
      language: showsLanguage ? form.language.trim() || null : null,
      fileUrl: showsFile ? (form.file?.fileUrl ?? null) : null,
      fileName: showsFile ? (form.file?.fileName ?? null) : null,
      fileSize: showsFile ? (form.file?.fileSize ?? null) : null,
      tags,
      collectionIds: form.collectionIds,
    });

    setCreating(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    toast.success("Item created");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" aria-hidden="true" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogDescription>
            Add a new snippet, prompt, command, note, or link.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-item-type">Type</Label>
            <Select
              value={form.type}
              onValueChange={(value) => setForm({ ...form, type: value as CreatableItemType })}
            >
              <SelectTrigger id="new-item-type">
                <SelectValue>
                  {(value: CreatableItemType | null) => {
                    const option = ITEM_TYPE_OPTIONS.find((item) => item.value === value);
                    if (!option) return null;
                    const Icon = option.icon;
                    return (
                      <>
                        <Icon className="size-4" style={{ color: option.color }} aria-hidden="true" />
                        {option.label}
                      </>
                    );
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ITEM_TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <Icon className="size-4" style={{ color: option.color }} aria-hidden="true" />
                      {option.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-item-title">Title</Label>
            <Input
              id="new-item-title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-item-description">Description</Label>
            <Textarea
              id="new-item-description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>

          {showsUrl && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-item-url">URL</Label>
              <Input
                id="new-item-url"
                type="url"
                value={form.url}
                onChange={(event) => setForm({ ...form, url: event.target.value })}
              />
            </div>
          )}

          {showsFile && (
            <div className="flex flex-col gap-1.5">
              <Label>{form.type === "image" ? "Image" : "File"}</Label>
              <FileUpload
                category={form.type as "file" | "image"}
                value={form.file}
                onChange={(file) => setForm({ ...form, file })}
              />
            </div>
          )}

          <ItemContentFields
            showsContent={showsContent}
            showsLanguage={showsLanguage}
            content={form.content}
            onContentChange={(next) => setForm({ ...form, content: next })}
            language={form.language}
            onLanguageChange={(next) => setForm({ ...form, language: next })}
            languageInputId="new-item-language"
          />

          <CollectionCheckboxList
            idPrefix="new-item"
            collections={collections}
            selectedIds={form.collectionIds}
            onChange={(collectionIds) => setForm({ ...form, collectionIds })}
            loading={collectionsLoading}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-item-tags">Tags</Label>
            <Input
              id="new-item-tags"
              placeholder="Comma-separated"
              value={form.tagsInput}
              onChange={(event) => setForm({ ...form, tagsInput: event.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleCreate} disabled={creating || !canSubmit}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

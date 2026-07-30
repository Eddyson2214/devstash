"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteItem, toggleItemFavorite, toggleItemPin, updateItem } from "@/actions/items";
import { ItemDrawerActions } from "@/components/items/ItemDrawerActions";
import { ItemEditForm, type EditFormState } from "@/components/items/ItemEditForm";
import { ItemViewContent } from "@/components/items/ItemViewContent";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollections } from "@/hooks/use-collections";
import { useItemDrawerData } from "@/hooks/use-item-drawer-data";

const CONTENT_TYPE_NAMES = new Set(["Snippet", "Prompt", "Command", "Note"]);
const LANGUAGE_TYPE_NAMES = new Set(["Snippet", "Command"]);
const URL_TYPE_NAMES = new Set(["Link"]);
const FILE_TYPE_NAMES = new Set(["File", "Image"]);

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPro?: boolean;
}

export function ItemDrawer({ itemId, open, onOpenChange, isPro = false }: ItemDrawerProps) {
  const router = useRouter();
  const { item, loading, setItem } = useItemDrawerData(itemId, open);
  const [form, setForm] = useState<EditFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [togglingPin, setTogglingPin] = useState(false);

  const editing = form !== null && form.id === itemId;
  const { collections, loading: collectionsLoading } = useCollections(editing);

  function handleOpenChange(next: boolean) {
    if (!next) setForm(null);
    onOpenChange(next);
  }

  const showsContent = item ? CONTENT_TYPE_NAMES.has(item.itemType.name) : false;
  const showsLanguage = item ? LANGUAGE_TYPE_NAMES.has(item.itemType.name) : false;
  const showsUrl = item ? URL_TYPE_NAMES.has(item.itemType.name) : false;
  const showsFile = item ? FILE_TYPE_NAMES.has(item.itemType.name) : false;

  async function handleCopy() {
    const text = item?.content ?? item?.url ?? "";
    if (!text) return;

    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  function startEdit() {
    if (!item || !itemId) return;
    setForm({
      id: itemId,
      title: item.title,
      description: item.description ?? "",
      content: item.content ?? "",
      url: item.url ?? "",
      language: item.language ?? "",
      tagsInput: item.tags.join(", "),
      collectionIds: item.collections.map((collection) => collection.id),
    });
  }

  function cancelEdit() {
    setForm(null);
  }

  async function handleSave() {
    if (!item || !form) return;

    setSaving(true);

    const tags = form.tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const response = await updateItem(item.id, {
      title: form.title.trim(),
      description: form.description.trim() || null,
      content: showsContent ? form.content || null : item.content,
      url: showsUrl ? form.url.trim() || null : item.url,
      language: showsLanguage ? form.language.trim() || null : item.language,
      tags,
      collectionIds: form.collectionIds,
    });

    setSaving(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    setItem({
      ...response.data,
      createdAt: response.data.createdAt.toISOString(),
      updatedAt: response.data.updatedAt.toISOString(),
    });
    setForm(null);
    toast.success("Item updated");
    router.refresh();
  }

  async function handleDelete() {
    if (!item) return;

    setDeleting(true);
    const response = await deleteItem(item.id);
    setDeleting(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    setConfirmingDelete(false);
    toast.success("Item deleted");
    handleOpenChange(false);
    router.refresh();
  }

  async function handleToggleFavorite() {
    if (!item) return;

    setTogglingFavorite(true);
    const response = await toggleItemFavorite(item.id);
    setTogglingFavorite(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    setItem({ ...item, isFavorite: response.isFavorite });
    router.refresh();
  }

  async function handleTogglePin() {
    if (!item) return;

    const previousItem = item;
    setItem({ ...item, isPinned: !item.isPinned });
    setTogglingPin(true);

    const response = await toggleItemPin(item.id);
    setTogglingPin(false);

    if (!response.success) {
      setItem(previousItem);
      toast.error(response.error);
      return;
    }

    toast.success(response.isPinned ? "Item pinned" : "Item unpinned");
    router.refresh();
  }

  const copyText = item?.content ?? item?.url ?? "";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
        {loading ? (
          <ItemDrawerSkeleton />
        ) : !item ? (
          <p className="p-4 text-sm text-muted-foreground">Couldn&apos;t load this item.</p>
        ) : (
          <>
            <ItemDrawerActions
              item={item}
              editing={editing}
              canSave={!!form?.title.trim()}
              saving={saving}
              deleting={deleting}
              confirmingDelete={confirmingDelete}
              onConfirmingDeleteChange={setConfirmingDelete}
              showsFile={showsFile}
              copyText={copyText}
              onCopy={handleCopy}
              onSave={handleSave}
              onCancelEdit={cancelEdit}
              onStartEdit={startEdit}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              togglingFavorite={togglingFavorite}
              onTogglePin={handleTogglePin}
              togglingPin={togglingPin}
            />

            <div className="flex flex-col gap-6 p-4">
              {editing && form ? (
                <ItemEditForm
                  form={form}
                  onChange={setForm}
                  showsContent={showsContent}
                  showsLanguage={showsLanguage}
                  showsUrl={showsUrl}
                  fileName={item.fileName}
                  collections={collections}
                  collectionsLoading={collectionsLoading}
                  isPro={isPro}
                />
              ) : (
                <ItemViewContent
                  item={item}
                  showsFile={showsFile}
                  showsLanguage={showsLanguage}
                  isPro={isPro}
                />
              )}

              {!editing && item.collections.length > 0 && (
                <section>
                  <h4 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Collections
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {item.collections.map((collection) => (
                      <Badge key={collection.id} variant="secondary">
                        {collection.name}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h4 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Details
                </h4>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span>{formatDate(item.updatedAt)}</span>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ItemDrawerSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-md" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

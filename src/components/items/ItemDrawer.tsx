"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Pencil, Pin, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteItem, updateItem } from "@/actions/items";
import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { ItemDetail } from "@/lib/db/items";
import { TYPE_ICONS } from "@/lib/type-icons";

type FetchedItemDetail = Omit<ItemDetail, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

interface EditFormState {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tagsInput: string;
}

const CONTENT_TYPE_NAMES = new Set(["Snippet", "Prompt", "Command", "Note"]);
const LANGUAGE_TYPE_NAMES = new Set(["Snippet", "Command"]);
const URL_TYPE_NAMES = new Set(["Link"]);

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
}

export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  const router = useRouter();
  const [result, setResult] = useState<{ id: string; detail: FetchedItemDetail | null } | null>(
    null
  );
  const [form, setForm] = useState<EditFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open || !itemId) return;

    let cancelled = false;

    fetch(`/api/items/${itemId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: FetchedItemDetail | null) => {
        if (!cancelled) setResult({ id: itemId, detail: data });
      });

    return () => {
      cancelled = true;
    };
  }, [open, itemId]);

  const loading = itemId !== null && result?.id !== itemId;
  const item = result?.id === itemId ? result.detail : null;
  const editing = form !== null && form.id === itemId;

  function handleOpenChange(next: boolean) {
    if (!next) setForm(null);
    onOpenChange(next);
  }

  const showsContent = item ? CONTENT_TYPE_NAMES.has(item.itemType.name) : false;
  const showsLanguage = item ? LANGUAGE_TYPE_NAMES.has(item.itemType.name) : false;
  const showsUrl = item ? URL_TYPE_NAMES.has(item.itemType.name) : false;

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
    });

    setSaving(false);

    if (!response.success) {
      toast.error(response.error);
      return;
    }

    setResult({
      id: response.data.id,
      detail: {
        ...response.data,
        createdAt: response.data.createdAt.toISOString(),
        updatedAt: response.data.updatedAt.toISOString(),
      },
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

  const Icon = item ? TYPE_ICONS[item.itemType.icon] : null;
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
            <SheetHeader className="gap-3 border-b p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${item.itemType.color}1a` }}
                >
                  {Icon && (
                    <Icon
                      className="size-5"
                      style={{ color: item.itemType.color }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <SheetTitle className="text-lg">{item.title}</SheetTitle>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">{item.itemType.name}</Badge>
                {item.language && <Badge variant="secondary">{item.language}</Badge>}
              </div>

              {editing ? (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving || !form?.title.trim()}>
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" disabled title="Coming soon">
                    <Star
                      className={item.isFavorite ? "fill-amber-400 text-amber-400" : ""}
                      aria-hidden="true"
                    />
                    Favorite
                  </Button>
                  <Button variant="ghost" size="sm" disabled title="Coming soon">
                    <Pin aria-hidden="true" />
                    Pin
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!copyText}>
                    <Copy aria-hidden="true" />
                    Copy
                  </Button>
                  <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={startEdit}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </Button>
                    <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
                      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <Trash2 className="text-destructive" aria-hidden="true" />
                        <span className="sr-only">Delete</span>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently deletes &ldquo;{item.title}&rdquo;. This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={deleting}
                            onClick={handleDelete}
                          >
                            {deleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </SheetHeader>

            <div className="flex flex-col gap-6 p-4">
              {editing && form ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="item-title">Title</Label>
                    <Input
                      id="item-title"
                      value={form.title}
                      onChange={(event) => setForm({ ...form, title: event.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="item-description">Description</Label>
                    <Textarea
                      id="item-description"
                      value={form.description}
                      onChange={(event) => setForm({ ...form, description: event.target.value })}
                    />
                  </div>

                  {showsContent && (
                    <div className="flex flex-col gap-1.5">
                      {showsLanguage ? (
                        <>
                          <Label>Content</Label>
                          <CodeEditor
                            value={form.content}
                            onChange={(next) => setForm({ ...form, content: next })}
                            language={form.language || null}
                          />
                        </>
                      ) : (
                        <>
                          <Label>Content</Label>
                          <MarkdownEditor
                            value={form.content}
                            onChange={(next) => setForm({ ...form, content: next })}
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
                        onChange={(event) => setForm({ ...form, language: event.target.value })}
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
                        onChange={(event) => setForm({ ...form, url: event.target.value })}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="item-tags">Tags</Label>
                    <Input
                      id="item-tags"
                      placeholder="Comma-separated"
                      value={form.tagsInput}
                      onChange={(event) => setForm({ ...form, tagsInput: event.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  {item.description && (
                    <section>
                      <h4 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Description
                      </h4>
                      <p className="text-sm">{item.description}</p>
                    </section>
                  )}

                  {item.contentType === "URL" && item.url ? (
                    <section>
                      <h4 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        URL
                      </h4>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm break-all text-primary underline underline-offset-4"
                      >
                        {item.url}
                      </a>
                    </section>
                  ) : (
                    item.content && (
                      <section>
                        <h4 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          Content
                        </h4>
                        {showsLanguage ? (
                          <CodeEditor value={item.content} language={item.language} readOnly />
                        ) : (
                          <MarkdownEditor value={item.content} readOnly />
                        )}
                      </section>
                    )
                  )}

                  {item.tags.length > 0 && (
                    <section>
                      <h4 className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}

              {item.collections.length > 0 && (
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

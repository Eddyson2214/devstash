"use client";

import { useEffect, useState } from "react";
import { Copy, Pencil, Pin, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { ItemDetail } from "@/lib/db/items";
import { TYPE_ICONS } from "@/lib/type-icons";

type FetchedItemDetail = Omit<ItemDetail, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

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
  const [result, setResult] = useState<{ id: string; detail: FetchedItemDetail | null } | null>(
    null
  );

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

  async function handleCopy() {
    const text = item?.content ?? item?.url ?? "";
    if (!text) return;

    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  const Icon = item ? TYPE_ICONS[item.itemType.icon] : null;
  const copyText = item?.content ?? item?.url ?? "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
                  <Button variant="ghost" size="sm" disabled title="Coming soon">
                    <Pencil aria-hidden="true" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="icon-sm" disabled title="Coming soon">
                    <Trash2 className="text-destructive" aria-hidden="true" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-6 p-4">
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
                    <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">
                      <code>{item.content}</code>
                    </pre>
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

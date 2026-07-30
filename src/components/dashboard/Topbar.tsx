"use client";

import Link from "next/link";
import { Search, Star } from "lucide-react";

import type { CreatableItemType } from "@/actions/items";
import { NewCollectionDialog } from "@/components/dashboard/NewCollectionDialog";
import { NewItemDialog } from "@/components/items/NewItemDialog";
import { useCommandPalette } from "@/components/search/CommandPaletteProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface TopbarProps {
  defaultItemType?: CreatableItemType;
  isPro?: boolean;
}

export function Topbar({ defaultItemType, isPro }: TopbarProps) {
  const { openCommandPalette } = useCommandPalette();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-6">
      <SidebarTrigger />

      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          placeholder="Search items... ⌘K"
          aria-label="Search items"
          className="pl-9"
          readOnly
          onClick={openCommandPalette}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {!isPro && (
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/upgrade" />}>
            Upgrade
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={<Link href="/favorites" />}
        >
          <Star aria-hidden="true" />
          <span className="sr-only">Favorites</span>
        </Button>
        <NewCollectionDialog />
        <NewItemDialog defaultType={defaultItemType} isPro={isPro} />
      </div>
    </header>
  );
}

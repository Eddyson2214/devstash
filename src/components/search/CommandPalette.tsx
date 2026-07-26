"use client";

import { useRouter } from "next/navigation";

import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SearchableCollection } from "@/lib/db/collections";
import type { SearchableItem } from "@/lib/db/items";
import { TYPE_ICONS } from "@/lib/type-icons";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SearchableItem[];
  collections: SearchableCollection[];
}

function substringFilter(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
}

export function CommandPalette({ open, onOpenChange, items, collections }: CommandPaletteProps) {
  const router = useRouter();
  const { openItemDrawer } = useItemDrawer();

  function selectItem(id: string) {
    onOpenChange(false);
    openItemDrawer(id);
  }

  function selectCollection(id: string) {
    onOpenChange(false);
    router.push(`/collections/${id}`);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search items and collections"
    >
      <Command filter={substringFilter}>
        <CommandInput placeholder="Search items and collections..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {items.length > 0 && (
            <CommandGroup heading="Items">
              {items.map((item) => {
                const Icon = TYPE_ICONS[item.itemType.icon];
                return (
                  <CommandItem key={item.id} value={item.title} onSelect={() => selectItem(item.id)}>
                    {Icon && (
                      <Icon
                        className="size-4"
                        style={{ color: item.itemType.color }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="flex-1 truncate">{item.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {collections.length > 0 && (
            <CommandGroup heading="Collections">
              {collections.map((collection) => (
                <CommandItem
                  key={collection.id}
                  value={collection.name}
                  onSelect={() => selectCollection(collection.id)}
                >
                  <span className="flex-1 truncate">{collection.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {collection.itemCount} item{collection.itemCount === 1 ? "" : "s"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

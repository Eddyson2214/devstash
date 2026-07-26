"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { CommandPalette } from "@/components/search/CommandPalette";
import type { SearchableCollection } from "@/lib/db/collections";
import type { SearchableItem } from "@/lib/db/items";

interface SearchData {
  items: SearchableItem[];
  collections: SearchableCollection[];
}

interface CommandPaletteContextValue {
  openCommandPalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within a CommandPaletteProvider");
  }
  return context;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<SearchData>({ items: [], collections: [] });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/search-data")
      .then((response) => (response.ok ? response.json() : null))
      .then((result: SearchData | null) => {
        if (!cancelled && result) setData(result);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ openCommandPalette: () => setOpen(true) }}>
      {children}
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={data.items}
        collections={data.collections}
      />
    </CommandPaletteContext.Provider>
  );
}

"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { ItemDrawer } from "@/components/items/ItemDrawer";

interface ItemDrawerContextValue {
  openItemDrawer: (itemId: string) => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function useItemDrawer() {
  const context = useContext(ItemDrawerContext);
  if (!context) {
    throw new Error("useItemDrawer must be used within an ItemDrawerProvider");
  }
  return context;
}

export function ItemDrawerProvider({ children }: { children: ReactNode }) {
  const [itemId, setItemId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const openItemDrawer = useCallback((id: string) => {
    setItemId(id);
    setOpen(true);
  }, []);

  return (
    <ItemDrawerContext.Provider value={{ openItemDrawer }}>
      {children}
      <ItemDrawer itemId={itemId} open={open} onOpenChange={setOpen} />
    </ItemDrawerContext.Provider>
  );
}

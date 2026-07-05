import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-6">
      <SidebarTrigger />

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search items..." className="pl-9" readOnly />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button>
          <Plus className="size-4" />
          New Item
        </Button>
      </div>
    </header>
  );
}

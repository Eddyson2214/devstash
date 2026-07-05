import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { ItemList } from "@/components/dashboard/ItemList";
import { RecentCollections } from "@/components/dashboard/RecentCollections";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Topbar } from "@/components/dashboard/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { items } from "@/lib/mock-data";

const RECENT_ITEMS_LIMIT = 10;

export default function DashboardPage() {
  const pinnedItems = items.filter((item) => item.isPinned);
  const recentItems = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, RECENT_ITEMS_LIMIT);

  return (
    <SidebarProvider className="min-h-screen">
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex flex-1 flex-col gap-8 p-6">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">Your developer knowledge hub</p>
          </div>

          <StatsCards />
          <RecentCollections />
          <ItemList title="Pinned" items={pinnedItems} emptyMessage="No pinned items yet." />
          <ItemList title="Recent Items" items={recentItems} emptyMessage="No items yet." />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

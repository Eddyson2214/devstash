import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { ItemList } from "@/components/dashboard/ItemList";
import { RecentCollections } from "@/components/dashboard/RecentCollections";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Topbar } from "@/components/dashboard/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getFavoriteCollections, getRecentCollections } from "@/lib/db/collections";
import { getItemTypesWithCounts, getPinnedItems, getRecentItems } from "@/lib/db/items";

const RECENT_ITEMS_LIMIT = 10;
const SIDEBAR_RECENT_COLLECTIONS_LIMIT = 5;

export default async function DashboardPage() {
  const [pinnedItems, recentItems, itemTypes, favoriteCollections, recentCollections] =
    await Promise.all([
      getPinnedItems(),
      getRecentItems(RECENT_ITEMS_LIMIT),
      getItemTypesWithCounts(),
      getFavoriteCollections(),
      getRecentCollections(SIDEBAR_RECENT_COLLECTIONS_LIMIT),
    ]);

  return (
    <SidebarProvider className="min-h-screen">
      <AppSidebar
        itemTypes={itemTypes}
        favoriteCollections={favoriteCollections}
        recentCollections={recentCollections}
      />
      <SidebarInset>
        <Topbar />
        <main className="flex flex-1 flex-col gap-8 p-6">
          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">Your developer knowledge hub</p>
          </div>

          <StatsCards />
          <RecentCollections />
          {pinnedItems.length > 0 && <ItemList title="Pinned" items={pinnedItems} emptyMessage="" />}
          <ItemList title="Recent Items" items={recentItems} emptyMessage="No items yet." />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

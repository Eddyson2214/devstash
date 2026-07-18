import { auth } from "@/auth";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { ItemList } from "@/components/dashboard/ItemList";
import { RecentCollections } from "@/components/dashboard/RecentCollections";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Topbar } from "@/components/dashboard/Topbar";
import { VerifyEmailBanner } from "@/components/dashboard/VerifyEmailBanner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  getCollectionStats,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getItemStats, getItemTypesWithCounts, getPinnedItems, getRecentItems } from "@/lib/db/items";

export const dynamic = "force-dynamic";

const RECENT_ITEMS_LIMIT = 10;
const RECENT_COLLECTIONS_LIMIT = 6;
const SIDEBAR_RECENT_COLLECTIONS_LIMIT = 5;

export default async function DashboardPage() {
  const [
    session,
    pinnedItems,
    recentItems,
    itemTypes,
    favoriteCollections,
    recentCollections,
    itemStats,
    collectionStats,
  ] = await Promise.all([
    auth(),
    getPinnedItems(),
    getRecentItems(RECENT_ITEMS_LIMIT),
    getItemTypesWithCounts(),
    getFavoriteCollections(),
    getRecentCollections(RECENT_COLLECTIONS_LIMIT),
    getItemStats(),
    getCollectionStats(),
  ]);

  return (
    <SidebarProvider className="min-h-screen">
      <AppSidebar
        itemTypes={itemTypes}
        favoriteCollections={favoriteCollections}
        recentCollections={recentCollections.slice(0, SIDEBAR_RECENT_COLLECTIONS_LIMIT)}
        user={{
          name: session?.user?.name,
          email: session?.user?.email,
          image: session?.user?.image,
        }}
      />
      <SidebarInset>
        <Topbar />
        <main className="flex flex-1 flex-col gap-8 p-6">
          {session?.user && !session.user.emailVerified && <VerifyEmailBanner />}

          <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground">Your developer knowledge hub</p>
          </div>

          <StatsCards itemStats={itemStats} collectionStats={collectionStats} />
          <RecentCollections recentCollections={recentCollections} />
          {pinnedItems.length > 0 && <ItemList title="Pinned" items={pinnedItems} emptyMessage="" />}
          <ItemList title="Recent Items" items={recentItems} emptyMessage="No items yet." />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { ItemList } from "@/components/dashboard/ItemList";
import { RecentCollections } from "@/components/dashboard/RecentCollections";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { Topbar } from "@/components/dashboard/Topbar";
import { VerifyEmailBanner } from "@/components/dashboard/VerifyEmailBanner";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import { CommandPaletteProvider } from "@/components/search/CommandPaletteProvider";
import { EditorPreferencesProvider } from "@/components/settings/EditorPreferencesProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  getCollectionStats,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getItemStats, getItemTypesWithCounts, getPinnedItems, getRecentItems } from "@/lib/db/items";
import { getEditorPreferences } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

const RECENT_ITEMS_LIMIT = 10;
const RECENT_COLLECTIONS_LIMIT = 6;
const SIDEBAR_RECENT_COLLECTIONS_LIMIT = 5;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  const userId = session.user.id;

  const [
    pinnedItems,
    recentItems,
    itemTypes,
    favoriteCollections,
    recentCollections,
    itemStats,
    collectionStats,
    editorPreferences,
  ] = await Promise.all([
    getPinnedItems(userId),
    getRecentItems(userId, RECENT_ITEMS_LIMIT),
    getItemTypesWithCounts(userId),
    getFavoriteCollections(),
    getRecentCollections(RECENT_COLLECTIONS_LIMIT),
    getItemStats(userId),
    getCollectionStats(userId),
    getEditorPreferences(userId),
  ]);

  return (
    <EditorPreferencesProvider initialPreferences={editorPreferences}>
      <ItemDrawerProvider>
        <CommandPaletteProvider>
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
              <Topbar isPro={session.user.isPro} />
              <main className="flex flex-1 flex-col gap-8 p-6">
                {session?.user && !session.user.emailVerified && <VerifyEmailBanner />}

                <div>
                  <h2 className="text-2xl font-bold">Dashboard</h2>
                  <p className="text-muted-foreground">Your developer knowledge hub</p>
                </div>

                <StatsCards itemStats={itemStats} collectionStats={collectionStats} />
                <RecentCollections recentCollections={recentCollections} />
                {pinnedItems.length > 0 && (
                  <ItemList title="Pinned" items={pinnedItems} emptyMessage="" />
                )}
                <ItemList title="Recent Items" items={recentItems} emptyMessage="No items yet." />
              </main>
            </SidebarInset>
          </SidebarProvider>
        </CommandPaletteProvider>
      </ItemDrawerProvider>
    </EditorPreferencesProvider>
  );
}

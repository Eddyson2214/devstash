import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { FavoritesList } from "@/components/favorites/FavoritesList";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import { CommandPaletteProvider } from "@/components/search/CommandPaletteProvider";
import { EditorPreferencesProvider } from "@/components/settings/EditorPreferencesProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getFavoriteCollections, getFavoriteCollectionsForUser, getRecentCollections } from "@/lib/db/collections";
import { getFavoriteItems, getItemTypesWithCounts } from "@/lib/db/items";
import { getEditorPreferences } from "@/lib/db/settings";

export const metadata: Metadata = {
  title: "Favorites - DevStash",
};

export const dynamic = "force-dynamic";

const SIDEBAR_RECENT_COLLECTIONS_LIMIT = 5;

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  const userId = session.user.id;

  const [
    favoriteItems,
    favoriteCollections,
    itemTypes,
    sidebarFavoriteCollections,
    recentCollections,
    editorPreferences,
  ] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollectionsForUser(userId),
    getItemTypesWithCounts(userId),
    getFavoriteCollections(),
    getRecentCollections(SIDEBAR_RECENT_COLLECTIONS_LIMIT),
    getEditorPreferences(userId),
  ]);

  return (
    <EditorPreferencesProvider initialPreferences={editorPreferences}>
      <ItemDrawerProvider>
        <CommandPaletteProvider>
          <SidebarProvider className="min-h-screen">
            <AppSidebar
              itemTypes={itemTypes}
              favoriteCollections={sidebarFavoriteCollections}
              recentCollections={recentCollections}
              user={{
                name: session?.user?.name,
                email: session?.user?.email,
                image: session?.user?.image,
              }}
            />
            <SidebarInset>
              <Topbar />
              <main className="flex flex-1 flex-col gap-6 p-6">
                <div>
                  <h2 className="text-2xl font-bold">Favorites</h2>
                  <p className="text-muted-foreground">
                    {favoriteItems.length + favoriteCollections.length} favorite
                    {favoriteItems.length + favoriteCollections.length === 1 ? "" : "s"}
                  </p>
                </div>

                <FavoritesList
                  favoriteItems={favoriteItems}
                  favoriteCollections={favoriteCollections}
                />
              </main>
            </SidebarInset>
          </SidebarProvider>
        </CommandPaletteProvider>
      </ItemDrawerProvider>
    </EditorPreferencesProvider>
  );
}

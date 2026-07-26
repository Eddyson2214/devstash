import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { CollectionGrid } from "@/components/collections/CollectionGrid";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import { CommandPaletteProvider } from "@/components/search/CommandPaletteProvider";
import { EditorPreferencesProvider } from "@/components/settings/EditorPreferencesProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  getCollectionsForUser,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getEditorPreferences } from "@/lib/db/settings";

export const dynamic = "force-dynamic";

const SIDEBAR_RECENT_COLLECTIONS_LIMIT = 5;

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  const userId = session.user.id;

  const [collections, itemTypes, favoriteCollections, recentCollections, editorPreferences] =
    await Promise.all([
      getCollectionsForUser(userId),
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
              favoriteCollections={favoriteCollections}
              recentCollections={recentCollections}
              user={{
                name: session?.user?.name,
                email: session?.user?.email,
                image: session?.user?.image,
              }}
            />
            <SidebarInset>
              <Topbar />
              <main className="flex flex-1 flex-col gap-8 p-6">
                <div>
                  <h2 className="text-2xl font-bold">Collections</h2>
                  <p className="text-muted-foreground">
                    {collections.length} collection{collections.length === 1 ? "" : "s"}
                  </p>
                </div>

                <CollectionGrid collections={collections} emptyMessage="No collections yet." />
              </main>
            </SidebarInset>
          </SidebarProvider>
        </CommandPaletteProvider>
      </ItemDrawerProvider>
    </EditorPreferencesProvider>
  );
}

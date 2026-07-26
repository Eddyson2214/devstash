import { notFound, redirect } from "next/navigation";
import { Star } from "lucide-react";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import { ItemGrid } from "@/components/items/ItemGrid";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  getCollectionById,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getItemsByCollection, getItemTypesWithCounts } from "@/lib/db/items";

export const dynamic = "force-dynamic";

const SIDEBAR_RECENT_COLLECTIONS_LIMIT = 5;

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  const userId = session.user.id;

  const collection = await getCollectionById(id, userId);
  if (!collection) {
    notFound();
  }

  const [items, itemTypes, favoriteCollections, recentCollections] = await Promise.all([
    getItemsByCollection(userId, id),
    getItemTypesWithCounts(userId),
    getFavoriteCollections(),
    getRecentCollections(SIDEBAR_RECENT_COLLECTIONS_LIMIT),
  ]);

  return (
    <ItemDrawerProvider>
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
              <div className="flex items-center gap-1.5">
                <h2 className="text-2xl font-bold">{collection.name}</h2>
                {collection.isFavorite && (
                  <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                )}
              </div>
              {collection.description && (
                <p className="text-muted-foreground">{collection.description}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length === 1 ? "" : "s"}
              </p>
            </div>

            <ItemGrid items={items} emptyMessage="No items in this collection yet." />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ItemDrawerProvider>
  );
}

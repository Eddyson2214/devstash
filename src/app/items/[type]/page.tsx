import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ItemGrid } from "@/components/items/ItemGrid";
import { getFavoriteCollections, getRecentCollections } from "@/lib/db/collections";
import { getItemsByType, getItemTypeBySlug, getItemTypesWithCounts } from "@/lib/db/items";
import { TYPE_ICONS } from "@/lib/type-icons";

export const dynamic = "force-dynamic";

const SIDEBAR_RECENT_COLLECTIONS_LIMIT = 5;

export default async function ItemTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const itemType = await getItemTypeBySlug(type);

  if (!itemType) {
    notFound();
  }

  const [session, items, itemTypes, favoriteCollections, recentCollections] = await Promise.all([
    auth(),
    getItemsByType(itemType.id),
    getItemTypesWithCounts(),
    getFavoriteCollections(),
    getRecentCollections(SIDEBAR_RECENT_COLLECTIONS_LIMIT),
  ]);

  const Icon = TYPE_ICONS[itemType.icon];

  return (
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
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: `${itemType.color}1a` }}
            >
              {Icon && <Icon className="size-5" style={{ color: itemType.color }} aria-hidden="true" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{itemType.name}s</h2>
              <p className="text-muted-foreground">
                {items.length} item{items.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <ItemGrid items={items} emptyMessage={`No ${itemType.name.toLowerCase()}s yet.`} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

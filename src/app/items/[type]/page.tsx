import { notFound, redirect } from "next/navigation";

import type { CreatableItemType } from "@/actions/items";
import { auth } from "@/auth";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FileList } from "@/components/items/FileList";
import { ImageGallery } from "@/components/items/ImageGallery";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import { ItemGrid } from "@/components/items/ItemGrid";
import { NewItemDialog } from "@/components/items/NewItemDialog";
import { UpgradePrompt } from "@/components/items/UpgradePrompt";
import { CommandPaletteProvider } from "@/components/search/CommandPaletteProvider";
import { EditorPreferencesProvider } from "@/components/settings/EditorPreferencesProvider";
import { getFavoriteCollections, getRecentCollections } from "@/lib/db/collections";
import { getItemsByType, getItemTypeBySlug, getItemTypesWithCounts } from "@/lib/db/items";
import { getEditorPreferences } from "@/lib/db/settings";
import { TYPE_ICONS } from "@/lib/type-icons";

export const dynamic = "force-dynamic";

const SIDEBAR_RECENT_COLLECTIONS_LIMIT = 5;
const CREATABLE_TYPE_NAMES = new Set([
  "Snippet",
  "Prompt",
  "Command",
  "Note",
  "Link",
  "File",
  "Image",
]);
const PRO_ONLY_TYPE_NAMES = new Set(["File", "Image"]);

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

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  const userId = session.user.id;

  const [items, itemTypes, favoriteCollections, recentCollections, editorPreferences] =
    await Promise.all([
      getItemsByType(userId, itemType.id),
      getItemTypesWithCounts(userId),
      getFavoriteCollections(),
      getRecentCollections(SIDEBAR_RECENT_COLLECTIONS_LIMIT),
      getEditorPreferences(userId),
    ]);

  const Icon = TYPE_ICONS[itemType.icon];
  const defaultItemType = CREATABLE_TYPE_NAMES.has(itemType.name)
    ? (itemType.name.toLowerCase() as CreatableItemType)
    : undefined;
  const isGated = PRO_ONLY_TYPE_NAMES.has(itemType.name) && !session.user.isPro;

  return (
    <EditorPreferencesProvider initialPreferences={editorPreferences}>
      <ItemDrawerProvider isPro={session.user.isPro}>
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
              <Topbar defaultItemType={defaultItemType} isPro={session.user.isPro} />
              <main className="flex flex-1 flex-col gap-8 p-6">
                {isGated ? (
                  <div className="flex flex-1 items-center justify-center">
                    <UpgradePrompt itemTypeName={itemType.name} />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-md"
                          style={{ backgroundColor: `${itemType.color}1a` }}
                        >
                          {Icon && (
                            <Icon
                              className="size-5"
                              style={{ color: itemType.color }}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{itemType.name}s</h2>
                          <p className="text-muted-foreground">
                            {items.length} item{items.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      {defaultItemType && (
                        <NewItemDialog
                          defaultType={defaultItemType}
                          triggerLabel={`New ${itemType.name}`}
                          isPro={session.user.isPro}
                        />
                      )}
                    </div>

                    {(() => {
                      const emptyMessage = `No ${itemType.name.toLowerCase()}s yet.`;
                      const emptyAction = defaultItemType && (
                        <NewItemDialog
                          defaultType={defaultItemType}
                          triggerLabel={`New ${itemType.name}`}
                          isPro={session.user.isPro}
                        />
                      );

                      if (itemType.name === "File") {
                        return (
                          <FileList
                            items={items}
                            emptyMessage={emptyMessage}
                            emptyAction={emptyAction}
                          />
                        );
                      }

                      if (itemType.name === "Image") {
                        return (
                          <ImageGallery
                            items={items}
                            emptyMessage={emptyMessage}
                            emptyAction={emptyAction}
                          />
                        );
                      }

                      return (
                        <ItemGrid items={items} emptyMessage={emptyMessage} emptyAction={emptyAction} />
                      );
                    })()}
                  </>
                )}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </CommandPaletteProvider>
      </ItemDrawerProvider>
    </EditorPreferencesProvider>
  );
}

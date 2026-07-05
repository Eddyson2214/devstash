"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code, Folder, Layers, Star } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  collections,
  currentUser,
  getRecentCollections,
  itemTypes,
  items,
} from "@/lib/mock-data";
import { TYPE_ICONS, typeHref } from "@/lib/type-icons";

const RECENT_COLLECTIONS_LIMIT = 5;

function userInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppSidebar() {
  const pathname = usePathname();

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const recentCollections = getRecentCollections(RECENT_COLLECTIONS_LIMIT);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <Layers className="text-primary" />
              <span className="font-semibold">DevStash</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Types</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemTypes.map((type) => {
                const Icon = TYPE_ICONS[type.icon] ?? Code;
                const href = typeHref(type.name);
                const count = items.filter((item) => item.itemTypeId === type.id).length;

                return (
                  <SidebarMenuItem key={type.id}>
                    <SidebarMenuButton
                      isActive={pathname === href}
                      tooltip={type.name}
                      render={<Link href={href} />}
                    >
                      <Icon style={{ color: type.color }} />
                      <span>{type.name}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{count}</SidebarMenuBadge>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Favorite Collections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {favoriteCollections.map((collection) => (
                <SidebarMenuItem key={collection.id}>
                  <SidebarMenuButton tooltip={collection.name}>
                    <Folder />
                    <span>{collection.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                  </SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Recent Collections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentCollections.map((collection) => (
                <SidebarMenuItem key={collection.id}>
                  <SidebarMenuButton tooltip={collection.name}>
                    <Folder />
                    <span>{collection.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Avatar className="size-6">
                <AvatarFallback>{userInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium">{currentUser.name}</span>
                <span className="truncate text-xs text-muted-foreground">{currentUser.email}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

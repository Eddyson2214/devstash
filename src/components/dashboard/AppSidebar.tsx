"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Code, Folder, Layers, Star } from "lucide-react";

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
import type { RecentCollection } from "@/lib/db/collections";
import type { ItemTypeWithCount } from "@/lib/db/items";
import { currentUser } from "@/lib/mock-data";
import { TYPE_ICONS, typeHref } from "@/lib/type-icons";

function userInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

interface AppSidebarProps {
  itemTypes: ItemTypeWithCount[];
  favoriteCollections: RecentCollection[];
  recentCollections: RecentCollection[];
}

export function AppSidebar({ itemTypes, favoriteCollections, recentCollections }: AppSidebarProps) {
  const pathname = usePathname();

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
                    <SidebarMenuBadge>{type.count}</SidebarMenuBadge>
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
                  <SidebarMenuBadge>
                    <span
                      className="block size-2.5 rounded-full"
                      style={{ backgroundColor: collection.accentColor ?? "var(--muted-foreground)" }}
                    />
                  </SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="View all collections"
                  render={<Link href="/collections" />}
                >
                  <ArrowRight />
                  <span>View all collections</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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

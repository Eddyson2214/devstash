"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Code, Folder, Layers, LogOut, Star, User as UserIcon } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { TYPE_ICONS, typeHref } from "@/lib/type-icons";

interface SidebarUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface AppSidebarProps {
  itemTypes: ItemTypeWithCount[];
  favoriteCollections: RecentCollection[];
  recentCollections: RecentCollection[];
  user: SidebarUser;
}

export function AppSidebar({ itemTypes, favoriteCollections, recentCollections, user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <Layers className="text-primary" aria-hidden="true" />
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
                      <Icon style={{ color: type.color }} aria-hidden="true" />
                      <span className="truncate">{type.name}</span>
                      {(type.name === "File" || type.name === "Image") && (
                        <Badge
                          variant="outline"
                          className="h-4 px-1.5 text-[10px] font-medium tracking-wide text-muted-foreground group-data-[collapsible=icon]:hidden"
                        >
                          PRO
                        </Badge>
                      )}
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
                    <Folder aria-hidden="true" />
                    <span>{collection.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden="true" />
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
                    <Folder aria-hidden="true" />
                    <span>{collection.name}</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>
                    <span
                      className="block size-2.5 rounded-full"
                      style={{ backgroundColor: collection.accentColor ?? "var(--muted-foreground)" }}
                      aria-hidden="true"
                    />
                  </SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="View all collections"
                  render={<Link href="/collections" />}
                >
                  <ArrowRight aria-hidden="true" />
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
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg">
                    <UserAvatar name={user.name} email={user.email} image={user.image} />
                    <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate text-sm font-medium">{user.name ?? "Unknown"}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent side="top" align="start">
                <DropdownMenuItem render={<Link href="/profile" />}>
                  <UserIcon aria-hidden="true" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => signOutAction()}>
                  <LogOut aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

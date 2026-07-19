import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Folder, Package } from "lucide-react";

import { auth } from "@/auth";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { ItemTypeBreakdown } from "@/components/profile/ItemTypeBreakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProfileStats, getProfileUser } from "@/lib/db/profile";

export const metadata: Metadata = {
  title: "Profile - DevStash",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [user, stats] = await Promise.all([
    getProfileUser(session.user.id),
    getProfileStats(session.user.id),
  ]);

  if (!user) {
    redirect("/sign-in");
  }

  const memberSince = user.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Dashboard
      </Link>

      <Card>
        <CardContent className="flex items-center gap-4">
          <UserAvatar name={user.name} email={user.email} image={user.image} className="size-16" />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold">{user.name ?? "Unknown"}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <span className="mt-1 text-xs text-muted-foreground">Member since {memberSince}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-md border p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                <Package className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.totalItems}</p>
                <p className="text-sm text-muted-foreground">Items</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                <Folder className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.totalCollections}</p>
                <p className="text-sm text-muted-foreground">Collections</p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">Items by type</p>
            <ItemTypeBreakdown itemsByType={stats.itemsByType} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {user.hasPassword && (
            <>
              <div>
                <p className="mb-3 text-sm font-medium">Change Password</p>
                <ChangePasswordForm />
              </div>
              <Separator />
            </>
          )}

          <div>
            <p className="mb-1 text-sm font-medium">Delete Account</p>
            <p className="mb-3 text-sm text-muted-foreground">
              Permanently delete your account and all of your items and collections.
            </p>
            <DeleteAccountDialog />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

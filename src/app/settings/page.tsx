import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProfileUser } from "@/lib/db/profile";

export const metadata: Metadata = {
  title: "Settings - DevStash",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await getProfileUser(session.user.id);

  if (!user) {
    redirect("/sign-in");
  }

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

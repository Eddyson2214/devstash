import type { Metadata } from "next";

import { auth } from "@/auth";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Profile - DevStash",
};

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <UserAvatar name={user?.name} image={user?.image} className="size-10" />
          <div className="flex flex-col leading-tight">
            <span className="font-medium">{user?.name ?? "Unknown"}</span>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

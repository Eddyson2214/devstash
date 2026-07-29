import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { UpgradePricing } from "@/components/upgrade/UpgradePricing";

export const metadata: Metadata = {
  title: "Upgrade - DevStash",
};

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  if (session.user.isPro) {
    redirect("/settings");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 p-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Dashboard
      </Link>

      <div className="mx-auto max-w-xl text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight">Upgrade to Pro</h1>
        <p className="text-muted-foreground">
          Unlimited items and collections, file & image storage, and AI features.
        </p>
      </div>

      <UpgradePricing />
    </div>
  );
}

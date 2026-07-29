"use client";

import { useState } from "react";
import { toast } from "sonner";

import { createBillingPortalSession, createCheckoutSession } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import type { BillingInfo } from "@/lib/db/billing";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface BillingCardProps {
  billingInfo: BillingInfo;
}

export function BillingCard({ billingInfo }: BillingCardProps) {
  const [pendingAction, setPendingAction] = useState<"monthly" | "yearly" | "manage" | null>(null);

  async function handleCheckout(interval: "monthly" | "yearly") {
    setPendingAction(interval);
    try {
      const result = await createCheckoutSession(interval);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      window.location.href = result.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleManage() {
    setPendingAction("manage");
    try {
      const result = await createBillingPortalSession();
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      window.location.href = result.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPendingAction(null);
    }
  }

  if (billingInfo.isPro) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium">Current Plan</p>
          <p className="text-sm text-muted-foreground">
            Pro
            {billingInfo.subscriptionStatus === "trialing" ? " · Trial" : ""}
            {billingInfo.currentPeriodEnd ? ` · Renews ${formatDate(billingInfo.currentPeriodEnd)}` : ""}
          </p>
        </div>
        <Button onClick={handleManage} disabled={pendingAction !== null} className="self-start">
          {pendingAction === "manage" ? "Loading..." : "Manage Subscription"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium">Current Plan</p>
        <p className="text-sm text-muted-foreground">Free</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => handleCheckout("monthly")} disabled={pendingAction !== null}>
          {pendingAction === "monthly" ? "Loading..." : "Upgrade — $8/mo"}
        </Button>
        <Button
          onClick={() => handleCheckout("yearly")}
          disabled={pendingAction !== null}
          variant="outline"
        >
          {pendingAction === "yearly" ? "Loading..." : "Upgrade — $72/yr"}
        </Button>
      </div>
    </div>
  );
}

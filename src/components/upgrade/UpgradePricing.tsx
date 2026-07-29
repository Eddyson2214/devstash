"use client";

import { useState } from "react";
import { toast } from "sonner";

import { createCheckoutSession } from "@/actions/billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "50 items total",
  "3 collections",
  "All system types except File & Image",
  "Basic search",
  "Standard support",
];

const PRO_FEATURES = [
  "Unlimited items",
  "Unlimited collections",
  "All system types, including File & Image",
  "AI auto-tagging, summaries & more",
  "JSON / ZIP data export",
  "Priority support",
];

export function UpgradePricing() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const result = await createCheckoutSession(yearly ? "yearly" : "monthly");
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      window.location.href = result.url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-center gap-4">
        <span
          className={cn(
            "text-sm font-semibold transition-colors",
            !yearly ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Monthly
        </span>
        <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Toggle yearly billing" />
        <span
          className={cn(
            "flex items-center gap-2 text-sm font-semibold transition-colors",
            yearly ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Yearly
          <Badge className="bg-emerald-500/20 text-[0.7rem] text-emerald-400">Save 25%</Badge>
        </span>
      </div>

      <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-border bg-card p-8">
          <h2 className="mb-1.5 text-xl font-bold">Free</h2>
          <p className="mb-5.5 text-sm text-muted-foreground">Your current plan.</p>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">$0</span>
            <span className="text-sm text-muted-foreground">/forever</span>
          </div>
          <ul className="mb-7 flex flex-1 flex-col gap-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="relative pl-6 text-sm text-muted-foreground">
                <span className="absolute top-1.5 left-0 size-2 rounded-sm bg-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="w-full" disabled>
            Current Plan
          </Button>
        </div>

        <div className="relative flex flex-col rounded-2xl border border-primary bg-card p-8">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-1 text-[0.72rem] font-bold whitespace-nowrap text-primary-foreground">
            Most Popular
          </span>
          <h2 className="mb-1.5 text-xl font-bold">Pro</h2>
          <p className="mb-5.5 text-sm text-muted-foreground">
            For developers who save everything.
          </p>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">
              {yearly ? "$72" : "$8"}
            </span>
            <span className="text-sm text-muted-foreground">{yearly ? "/yr" : "/mo"}</span>
          </div>
          <ul className="mb-7 flex flex-1 flex-col gap-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="relative pl-6 text-sm text-muted-foreground">
                <span className="absolute top-1.5 left-0 size-2 rounded-sm bg-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
          <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
            {loading ? "Loading..." : `Upgrade — ${yearly ? "$72/yr" : "$8/mo"}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

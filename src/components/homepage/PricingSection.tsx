"use client";

import { useState } from "react";
import Link from "next/link";

import { FadeIn } from "@/components/homepage/FadeIn";
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

export function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <FadeIn className="mx-auto mb-10 max-w-xl text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="text-[1.05rem] text-muted-foreground">
          Start free. Upgrade when you need unlimited space and AI features.
        </p>
      </FadeIn>

      <FadeIn className="mb-12 flex items-center justify-center gap-4">
        <span
          className={cn(
            "text-sm font-semibold transition-colors",
            !yearly ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Monthly
        </span>
        <Switch
          checked={yearly}
          onCheckedChange={setYearly}
          aria-label="Toggle yearly billing"
        />
        <span
          className={cn(
            "flex items-center gap-2 text-sm font-semibold transition-colors",
            yearly ? "text-foreground" : "text-muted-foreground"
          )}
        >
          Yearly
          <Badge className="bg-emerald-500/20 text-[0.7rem] text-emerald-400">
            Save 25%
          </Badge>
        </span>
      </FadeIn>

      <FadeIn className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-border bg-card p-8">
          <h3 className="mb-1.5 text-xl font-bold">Free</h3>
          <p className="mb-5.5 text-sm text-muted-foreground">
            Everything you need to get organized.
          </p>
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
          <Button
            variant="secondary"
            className="w-full"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Get Started Free
          </Button>
        </div>

        <div className="relative flex flex-col rounded-2xl border border-indigo-500 bg-gradient-to-b from-indigo-500/10 to-card to-40% p-8 shadow-[0_0_0_1px_rgba(99,102,241,0.4)]">
          <span className="homepage-gradient-bg absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1 text-[0.72rem] font-bold whitespace-nowrap text-white">
            Most Popular
          </span>
          <h3 className="mb-1.5 text-xl font-bold">Pro</h3>
          <p className="mb-5.5 text-sm text-muted-foreground">
            For developers who save everything.
          </p>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">
              {yearly ? "$72" : "$8"}
            </span>
            <span className="text-sm text-muted-foreground">
              {yearly ? "/yr" : "/mo"}
            </span>
          </div>
          <ul className="mb-7 flex flex-1 flex-col gap-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="relative pl-6 text-sm text-muted-foreground">
                <span className="absolute top-1.5 left-0 size-2 rounded-sm bg-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            className="homepage-gradient-bg w-full text-white hover:opacity-90"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Upgrade to Pro
          </Button>
        </div>
      </FadeIn>
    </section>
  );
}

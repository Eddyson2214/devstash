import Link from "next/link";

import { FadeIn } from "@/components/homepage/FadeIn";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <FadeIn className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h2 className="mb-3.5 text-3xl font-bold tracking-tight sm:text-4xl">
        Ready to organize your knowledge?
      </h2>
      <p className="mb-7 text-[1.05rem] text-muted-foreground">
        Join developers who stopped losing snippets, prompts, and commands to
        scattered tabs.
      </p>
      <Button
        size="lg"
        className="homepage-gradient-bg text-white hover:opacity-90"
        nativeButton={false}
        render={<Link href="/register" />}
      >
        Get Started Free
      </Button>
    </FadeIn>
  );
}

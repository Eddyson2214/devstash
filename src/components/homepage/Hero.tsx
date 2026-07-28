import Link from "next/link";

import { FadeIn } from "@/components/homepage/FadeIn";
import { HeroVisual } from "@/components/homepage/HeroVisual";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <header className="mx-auto flex max-w-6xl flex-col items-center gap-14 px-6 pt-36 pb-20 sm:pt-40 sm:pb-24 md:gap-18">
      <FadeIn className="max-w-2xl text-center">
        <span className="mb-5 inline-block rounded-full border border-border bg-muted px-3.5 py-1.5 text-[0.8rem] font-semibold text-muted-foreground">
          Built for developers
        </span>
        <h1 className="mb-5 text-[2.4rem] leading-[1.1] font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Stop Losing Your{" "}
          <span className="homepage-gradient-text">Developer Knowledge</span>
        </h1>
        <p className="mx-auto mb-8 max-w-md text-lg text-muted-foreground">
          Snippets, prompts, commands, notes, files, and links — scattered across a
          dozen apps. DevStash brings all of it into one fast, searchable,
          AI-enhanced hub.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Button
            size="lg"
            className="homepage-gradient-bg text-white hover:opacity-90"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Get Started Free
          </Button>
          <Button
            size="lg"
            variant="secondary"
            nativeButton={false}
            render={<a href="#features" />}
          >
            See How It Works
          </Button>
        </div>
      </FadeIn>

      <FadeIn className="w-full">
        <HeroVisual />
      </FadeIn>
    </header>
  );
}

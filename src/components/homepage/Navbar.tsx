import Link from "next/link";

import { NavbarScroll } from "@/components/homepage/NavbarScroll";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <NavbarScroll>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-[1.05rem] font-bold">
          <span className="homepage-gradient-bg flex size-8 items-center justify-center rounded-[9px] text-xs font-extrabold tracking-tight text-white">
            DS
          </span>
          DevStash
        </Link>

        <div className="hidden flex-1 justify-center gap-8 sm:flex">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
            Sign In
          </Button>
          <Button
            className="homepage-gradient-bg text-white hover:opacity-90"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Get Started
          </Button>
        </div>
      </div>
    </NavbarScroll>
  );
}

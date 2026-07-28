"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface NavbarScrollProps {
  children: React.ReactNode;
}

export function NavbarScroll({ children }: NavbarScrollProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 12);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent backdrop-blur-md transition-colors duration-250",
        scrolled ? "bg-background/85 border-border" : "bg-background/40"
      )}
    >
      {children}
    </nav>
  );
}

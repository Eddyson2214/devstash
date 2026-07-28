import Link from "next/link";

const FOOTER_LINK_GROUPS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border px-6 pt-14 pb-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 pb-10 sm:grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5 text-[1.05rem] font-bold">
            <span className="homepage-gradient-bg flex size-8 items-center justify-center rounded-[9px] text-xs font-extrabold tracking-tight text-white">
              DS
            </span>
            DevStash
          </Link>
          <p className="mt-3 max-w-60 text-sm text-muted-foreground">
            One hub for all your developer knowledge.
          </p>
        </div>

        {FOOTER_LINK_GROUPS.map((group) => (
          <div key={group.heading} className="flex flex-col">
            <h4 className="mb-3.5 text-[0.85rem] tracking-wide text-muted-foreground uppercase">
              {group.heading}
            </h4>
            {group.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-6xl border-t border-border pt-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} DevStash. All rights reserved.
      </div>
    </footer>
  );
}

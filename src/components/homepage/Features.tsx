import { Code, Files, LayoutGrid, Search, Sparkles, Terminal } from "lucide-react";

import { FadeIn } from "@/components/homepage/FadeIn";

const FEATURES = [
  {
    title: "Code Snippets",
    description:
      "Save reusable code with syntax highlighting for every language you work in.",
    icon: Code,
    accent: "#3b82f6",
  },
  {
    title: "AI Prompts",
    description:
      "Store and organize the prompts you actually reuse, instead of digging through chat history.",
    icon: Sparkles,
    accent: "#8b5cf6",
  },
  {
    title: "Instant Search",
    description:
      "Find anything across content, tags, titles, and types in a fraction of a second.",
    icon: Search,
    accent: "#10b981",
  },
  {
    title: "Commands",
    description:
      "Keep the terminal commands you always forget one search away, no more digging through history.",
    icon: Terminal,
    accent: "#f97316",
  },
  {
    title: "Files & Docs",
    description:
      "Upload files and images so context lives right next to the rest of your knowledge.",
    icon: Files,
    accent: "#6b7280",
  },
  {
    title: "Collections",
    description:
      "Group any mix of item types into collections — a snippet and a prompt can live side by side.",
    icon: LayoutGrid,
    accent: "#fde047",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <FadeIn className="mx-auto mb-12 max-w-xl text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you capture, in one place
        </h2>
        <p className="text-[1.05rem] text-muted-foreground">
          Seven ways to save what matters, unified under one fast search.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <FadeIn key={feature.title}>
            <div
              className="group h-full rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-[color:var(--accent)]"
              style={{ "--accent": feature.accent } as React.CSSProperties}
            >
              <div
                className="mb-4.5 flex size-11 items-center justify-center rounded-[11px] bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[color:var(--accent)]"
              >
                <feature.icon className="size-5.5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-[1.1rem] font-bold">{feature.title}</h3>
              <p className="text-[0.92rem] text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

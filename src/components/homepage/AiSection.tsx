import { Check } from "lucide-react";

import { FadeIn } from "@/components/homepage/FadeIn";
import { Badge } from "@/components/ui/badge";

const CHECKLIST = [
  "AI auto-tag suggestions",
  "Instant AI summaries",
  '"Explain this code" on demand',
  "AI prompt optimizer",
];

const AI_TAGS = [
  { label: "typescript", accent: "#3b82f6" },
  { label: "utility", accent: "#10b981" },
  { label: "performance", accent: "#f59e0b" },
];

export function AiSection() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-24 md:grid-cols-2 md:gap-16">
      <FadeIn>
        <Badge className="mb-4.5 bg-pink-500/20 text-pink-400 uppercase tracking-wide">
          Pro Feature
        </Badge>
        <h2 className="mb-3.5 text-[1.8rem] font-bold tracking-tight sm:text-[2.3rem]">
          Let AI do the busywork
        </h2>
        <p className="mb-7 text-[1.05rem] text-muted-foreground">
          Stop manually tagging and summarizing everything you save. DevStash Pro
          does it for you.
        </p>
        <ul className="flex flex-col gap-3.5">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-center gap-3 font-medium">
              <Check
                className="size-5 flex-none rounded-full bg-emerald-500/16 p-0.5 text-emerald-500"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </FadeIn>

      <FadeIn>
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="flex items-center gap-3 border-b border-border bg-muted px-4 py-3">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-red-500" />
              <span className="size-2.5 rounded-full bg-amber-500" />
              <span className="size-2.5 rounded-full bg-green-500" />
            </div>
            <span className="font-mono text-[0.8rem] text-muted-foreground">
              debounce.ts
            </span>
          </div>
          <div className="p-5">
            <pre className="overflow-x-auto font-mono text-[0.85rem] leading-relaxed text-muted-foreground">
              <code>
                <span className="text-pink-400">function</span>{" "}
                <span className="text-blue-400">debounce</span>
                {"(fn, delay) {\n  "}
                <span className="text-pink-400">let</span> timer;
                {"\n  "}
                <span className="text-pink-400">return</span> (...args) =&gt; {"{\n    "}
                <span className="text-blue-400">clearTimeout</span>
                {"(timer);\n    timer = "}
                <span className="text-blue-400">setTimeout</span>
                {"(() => fn(...args), delay);\n  };\n}"}
              </code>
            </pre>
            <div className="mt-5 border-t border-dashed border-border pt-4.5">
              <span className="mb-2.5 block text-[0.75rem] font-semibold tracking-wide text-muted-foreground uppercase">
                AI Generated Tags
              </span>
              <div className="flex flex-wrap gap-2">
                {AI_TAGS.map((tag, i) => (
                  <span
                    key={tag.label}
                    className="homepage-tag-pop rounded-full border px-2.5 py-1 text-[0.78rem] font-semibold"
                    style={{
                      color: tag.accent,
                      backgroundColor: `color-mix(in srgb, ${tag.accent} 16%, transparent)`,
                      borderColor: `color-mix(in srgb, ${tag.accent} 35%, transparent)`,
                      animationDelay: `${0.15 + i * 0.2}s`,
                    }}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

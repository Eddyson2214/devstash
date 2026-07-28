"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

const REPEL_RADIUS = 90;
const REPEL_STRENGTH = 900;
const MAX_SPEED = 0.6;

const CHAOS_ICONS = [
  {
    label: "Notion",
    svg: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <rect x="8" y="7" width="3" height="3" rx="0.5" />
        <line x1="13" y1="8.5" x2="16" y2="8.5" />
        <rect x="8" y="12" width="3" height="3" rx="0.5" />
        <line x1="13" y1="13.5" x2="16" y2="13.5" />
      </>
    ),
  },
  {
    label: "GitHub",
    svg: (
      <>
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
      </>
    ),
  },
  {
    label: "Slack",
    svg: (
      <>
        <rect x="4" y="5" width="16" height="12" rx="3" />
        <polygon points="9,17 13,17 9,21" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "VS Code",
    svg: (
      <>
        <polyline points="9 8 4 12 9 16" />
        <polyline points="15 8 20 12 15 16" />
      </>
    ),
  },
  {
    label: "Browser Tabs",
    svg: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <circle cx="6.5" cy="7" r="0.6" fill="currentColor" stroke="none" />
        <circle cx="9" cy="7" r="0.6" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "Terminal",
    svg: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <polyline points="7 9 11 12 7 15" />
        <line x1="12" y1="15" x2="16" y2="15" />
      </>
    ),
  },
  {
    label: "Text File",
    svg: (
      <>
        <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <polyline points="13 3 13 8 18 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </>
    ),
  },
  {
    label: "Bookmark",
    svg: <path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16l-6-3.5L6 20V4z" />,
  },
] as const;

const MINI_CARD_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#f97316",
  "#fde047",
  "#ec4899",
  "#10b981",
];

interface IconState {
  el: HTMLDivElement;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const icons = iconRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (!icons.length) return;

    let bounds = container.getBoundingClientRect();
    const handleResize = () => {
      bounds = container.getBoundingClientRect();
    };
    window.addEventListener("resize", handleResize);

    const state: IconState[] = icons.map((el, i) => {
      const size = el.offsetWidth || 52;
      const x = Math.random() * Math.max(1, bounds.width - size);
      const y = Math.random() * Math.max(1, bounds.height - size);
      const angle = Math.random() * Math.PI * 2;
      el.style.animationDelay = `${(i * 0.4).toFixed(2)}s`;
      return {
        el,
        size,
        x,
        y,
        vx: Math.cos(angle) * (0.15 + Math.random() * 0.2),
        vy: Math.sin(angle) * (0.15 + Math.random() * 0.2),
      };
    });

    let mouseX = -9999;
    let mouseY = -9999;
    let mouseActive = false;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
      mouseActive = true;
    };
    const handleMouseLeave = () => {
      mouseActive = false;
      mouseX = -9999;
      mouseY = -9999;
    };
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let lastTime = performance.now();
    let frameId = 0;

    function tick(now: number) {
      const dt = Math.min(32, now - lastTime);
      lastTime = now;

      bounds = container!.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;

      for (const item of state) {
        if (mouseActive) {
          const cx = item.x + item.size / 2;
          const cy = item.y + item.size / 2;
          const dx = cx - mouseX;
          const dy = cy - mouseY;
          const dist = Math.hypot(dx, dy);
          if (dist < REPEL_RADIUS && dist > 0.01) {
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
            item.vx += (dx / dist) * force * 0.00005 * dt;
            item.vy += (dy / dist) * force * 0.00005 * dt;
          }
        }

        const speed = Math.hypot(item.vx, item.vy);
        if (speed > MAX_SPEED) {
          item.vx = (item.vx / speed) * MAX_SPEED;
          item.vy = (item.vy / speed) * MAX_SPEED;
        }

        item.x += item.vx * dt;
        item.y += item.vy * dt;

        const maxX = Math.max(0, width - item.size);
        const maxY = Math.max(0, height - item.size);

        if (item.x < 0) {
          item.x = 0;
          item.vx = Math.abs(item.vx);
        } else if (item.x > maxX) {
          item.x = maxX;
          item.vx = -Math.abs(item.vx);
        }

        if (item.y < 0) {
          item.y = 0;
          item.vy = Math.abs(item.vy);
        } else if (item.y > maxY) {
          item.y = maxY;
          item.vy = -Math.abs(item.vy);
        }

        item.el.style.transform = `translate(${item.x}px, ${item.y}px)`;
      }

      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame((now) => {
      lastTime = now;
      frameId = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-7 md:flex-row">
      <div className="min-w-0 flex-1 rounded-[20px] border border-border bg-card p-5 shadow-lg md:w-full">
        <span className="mb-3.5 block text-center text-[0.8rem] font-semibold text-muted-foreground">
          Your knowledge today...
        </span>
        <div ref={containerRef} className="relative h-[220px] overflow-hidden sm:h-[260px]">
          {CHAOS_ICONS.map((icon, i) => (
            <div
              key={icon.label}
              ref={(el) => {
                iconRefs.current[i] = el;
              }}
              className="homepage-icon-pulse absolute top-0 left-0 flex size-[52px] items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground will-change-transform"
              data-label={icon.label}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
                aria-hidden="true"
              >
                {icon.svg}
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div
        className="homepage-arrow-pulse flex-none text-muted-foreground"
        aria-hidden="true"
      >
        <ArrowRight className="size-10" />
      </div>

      <div className="min-w-0 flex-1 rounded-[20px] border border-border bg-card p-5 shadow-lg md:w-full">
        <span className="mb-3.5 block text-center text-[0.8rem] font-semibold text-muted-foreground">
          ...with DevStash
        </span>
        <div className="flex h-[220px] gap-3 sm:h-[260px]">
          <div className="flex w-14 flex-none flex-col gap-2.5 rounded-lg border border-border bg-background p-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded ${i === 0 ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2.5">
            {MINI_CARD_COLORS.map((color, i) => (
              <div
                key={i}
                className="min-h-0 rounded-lg border border-border bg-background"
                style={{ borderTop: `3px solid ${color}` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

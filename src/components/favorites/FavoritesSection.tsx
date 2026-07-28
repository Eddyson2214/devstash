import type { ReactNode } from "react";

interface FavoritesSectionProps {
  title: string;
  count: number;
  emptyMessage: string;
  children: ReactNode;
}

export function FavoritesSection({ title, count, emptyMessage, children }: FavoritesSectionProps) {
  return (
    <section>
      <h3 className="mb-2 font-mono text-sm font-semibold text-muted-foreground">
        {title} ({count})
      </h3>
      {count === 0 ? (
        <p className="px-2 py-1.5 font-mono text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="divide-y divide-border/60">{children}</div>
      )}
    </section>
  );
}

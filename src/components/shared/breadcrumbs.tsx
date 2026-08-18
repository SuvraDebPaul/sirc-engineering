import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Breadcrumb trail.
 *
 * A `<nav>` around an ordered list, because the order is the meaning. The
 * separators are decorative text rather than list markers, so a screen reader
 * reads "Home, Products" instead of "Home slash Products".
 *
 * The last crumb is the current page: it renders as plain text with
 * `aria-current`, not as a link back to where you already are.
 */
export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground", className)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-primary">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span aria-hidden="true" className="text-muted-foreground/50">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

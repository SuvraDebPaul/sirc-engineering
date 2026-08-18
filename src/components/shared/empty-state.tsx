import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * "There is nothing here" — one component, nine call sites.
 *
 * An empty cart, an empty wishlist, a category with no stock and a search that
 * matched nothing were each hand-built with the same dashed border, the same
 * spacing and slightly different copy weights. Unifying them means an empty
 * state cannot look like a broken page on one route and a designed one on
 * another.
 *
 * `actions` rather than fixed buttons, because the way *out* of an empty state
 * is the part that genuinely differs: an empty cart offers the catalogue, a
 * failed search offers the quotation form, and a category with no stock offers
 * both.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  size = "default",
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** `compact` for panels inside a page, `default` for a whole route. */
  size?: "default" | "compact";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center",
        size === "default" ? "py-20 sm:py-24" : "py-12",
        className,
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            "text-muted-foreground/30",
            size === "default" ? "size-14" : "size-10",
          )}
          strokeWidth={1.25}
          aria-hidden="true"
        />
      )}

      <h2 className={cn("font-semibold", Icon && "mt-5", size === "default" ? "text-lg" : "text-base")}>
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {actions && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      )}
    </div>
  );
}

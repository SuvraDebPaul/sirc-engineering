import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Shared section heading.
 *
 * Every band on the home page is titled the same way. Centralising it means the
 * rhythm stays consistent as sections are added, and one change restyles them
 * all.
 *
 * Two layouts:
 *  - `center` (default) stacks title over subtitle, centred.
 *  - `start` puts the text block on the left and `action`/`actions` on the
 *    right of the same row, vertically centred against it — used where a
 *    section owns controls, such as carousel arrows.
 */
export function SectionHeading({
  id,
  title,
  subtitle,
  align = "center",
  action,
  actions,
  className,
}: {
  /** Set when a section uses aria-labelledby to point at this heading. */
  id?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  /** Convenience for the common "View all →" link. */
  action?: { label: string; href: string };
  /** Arbitrary controls for the right-hand side, e.g. carousel arrows. */
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-wrap gap-4",
        align === "center"
          ? "flex-col items-center justify-center text-center"
          : "items-center justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        <h2
          id={id}
          className="text-xl uppercase font-bold tracking-tight sm:text-3xl"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {(actions || action) && (
        <div className="flex shrink-0 items-center gap-3">
          {action && (
            <Link
              href={action.href}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {action.label} →
            </Link>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}

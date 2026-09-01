import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";

import { catalogHref, type RawSearchParams, type ViewMode } from "@/features/catalog/services/catalog";
import { cn } from "@/lib/utils";

/**
 * Grid / list switch.
 *
 * Two links rather than a client toggle, so the choice lives in the URL beside
 * every other listing preference and the component costs nothing to hydrate.
 * `show` is preserved deliberately — changing how results are drawn should not
 * throw away the ones already loaded.
 */
const VIEWS = [
  { value: "grid", label: "Grid view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
] as const satisfies readonly { value: ViewMode; label: string; icon: typeof LayoutGrid }[];

export function ViewToggle({
  view,
  params,
  basePath = "/products",
}: {
  view: ViewMode;
  params: RawSearchParams;
  basePath?: string;
}) {
  const show = typeof params.show === "string" ? params.show : null;

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1"
      role="group"
      aria-label="Result layout"
    >
      {VIEWS.map(({ value, label, icon: Icon }) => {
        const active = view === value;

        return (
          <Link
            key={value}
            href={catalogHref(params, { view: value === "grid" ? null : value, show }, basePath)}
            scroll={false}
            aria-current={active ? "true" : undefined}
            aria-label={label}
            title={label}
            className={cn(
              "grid size-8 place-items-center rounded-full transition-all duration-200",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}

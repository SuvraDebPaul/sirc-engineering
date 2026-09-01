import Link from "next/link";
import { Check, X } from "lucide-react";

import {
  catalogHref,
  hasActiveFilters,
  toggleValue,
  type CatalogQuery,
  type Facet,
  type Facets,
  type RawSearchParams,
} from "@/features/catalog/services/catalog";
import { cn } from "@/lib/utils";

/**
 * The filter sidebar.
 *
 * Every control is a link, which is why this whole panel is a server component
 * and ships no JavaScript. A filter changes what the page shows and gets its
 * own URL, so a link is the honest element for it — and it means filtering
 * works before hydration, survives a refresh, and can be shared or bookmarked.
 *
 * The reference design filters tools by colour and size. Neither means anything
 * for a thermal imager, so those two groups are replaced by the facets an
 * industrial buyer actually narrows on: availability and brand. Everything else
 * follows the reference's structure.
 *
 * Options that would return nothing stay visible but inert, rather than being
 * dropped. A sidebar that reshuffles as you click it is much harder to use than
 * one with a few greyed-out rows.
 */
function FilterGroup({
  title,
  children,
  scroll = false,
}: {
  title: string;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div className={cn(scroll && "max-h-64 overflow-y-auto pr-1")}>{children}</div>
    </section>
  );
}

/** A checkbox-styled link. Multi-select: following it toggles one value. */
function FacetCheckbox({ facet, href }: { facet: Facet; href: string }) {
  const disabled = facet.count === 0 && !facet.active;

  const body = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded border transition-colors",
          facet.active ? "border-primary bg-primary text-primary-foreground" : "border-input",
        )}
      >
        {facet.active && <Check className="size-3" strokeWidth={3} />}
      </span>

      <span className="min-w-0 flex-1 truncate">{facet.label}</span>
      <span className="shrink-0 tabular-nums text-muted-foreground">({facet.count})</span>
    </>
  );

  const className = "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors duration-200";

  if (disabled) {
    return (
      <span className={cn(className, "cursor-not-allowed text-muted-foreground/40")}>{body}</span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      aria-current={facet.active ? "true" : undefined}
      aria-label={`${facet.active ? "Remove filter" : "Filter by"}: ${facet.label}, ${facet.count} products`}
      className={cn(className, "hover:bg-muted", facet.active && "font-medium")}
    >
      {body}
    </Link>
  );
}

/** A single-select row: following it applies the value, or clears it if active. */
function FacetRadio({
  facet,
  href,
  children,
}: {
  facet: Facet;
  href: string;
  children?: React.ReactNode;
}) {
  const disabled = facet.count === 0 && !facet.active;

  const body = (
    <>
      <span className="min-w-0 flex-1 truncate">{children ?? facet.label}</span>
      <span className="shrink-0 tabular-nums text-muted-foreground">({facet.count})</span>
    </>
  );

  const className = "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors duration-200";

  if (disabled) {
    return (
      <span className={cn(className, "cursor-not-allowed text-muted-foreground/40")}>{body}</span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      aria-current={facet.active ? "true" : undefined}
      aria-label={`${facet.active ? "Remove filter" : "Filter by"}: ${facet.label}, ${facet.count} products`}
      className={cn(
        className,
        facet.active ? "font-medium text-primary" : "hover:bg-muted hover:text-foreground",
      )}
    >
      {body}
    </Link>
  );
}

export function FilterPanel({
  facets,
  query,
  params,
  basePath = "/products",
  hideCategories = false,
}: {
  facets: Facets;
  query: CatalogQuery;
  params: RawSearchParams;
  basePath?: string;
  /** Dropped on a category page, where the category is fixed by the route. */
  hideCategories?: boolean;
}) {
  const href = (changes: Record<string, string | null>) => catalogHref(params, changes, basePath);
  return (
    <div className="space-y-5">
      {hasActiveFilters(query) && (
        <Link
          href={catalogHref({}, { view: query.view === "list" ? "list" : null, sort: query.sort === "featured" ? null : query.sort }, basePath)}
          scroll={false}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-primary/5 hover:text-primary"
        >
          <X className="size-3.5" aria-hidden="true" />
          Clear all filters
        </Link>
      )}

      {!hideCategories && (
      <FilterGroup title="Shop by category" scroll>
        {facets.categories.map((facet) => (
          <FacetCheckbox
            key={facet.value}
            facet={facet}
            href={href({ category: toggleValue(query.categories, facet.value) })}
          />
        ))}
      </FilterGroup>
      )}

      <FilterGroup title="Highlight">
        {facets.highlights.map((facet) => (
          <FacetRadio
            key={facet.value}
            facet={facet}
            href={href({ highlight: facet.value === "all" ? null : facet.value })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        {facets.stock.map((facet) => (
          <FacetCheckbox
            key={facet.value}
            facet={facet}
            href={href({ stock: toggleValue(query.stock, facet.value) })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Brands" scroll>
        {facets.brands.map((facet) => (
          <FacetCheckbox
            key={facet.value}
            facet={facet}
            href={href({ brand: toggleValue(query.brands, facet.value) })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        <Link
          href={href({ price: null })}
          scroll={false}
          aria-current={query.price === null ? "true" : undefined}
          className={cn(
            "flex rounded-lg px-2 py-1.5 text-sm transition-colors duration-200",
            query.price === null ? "font-medium text-primary" : "hover:bg-muted",
          )}
        >
          All prices
        </Link>

        {facets.prices.map((facet) => (
          <FacetRadio
            key={facet.value}
            facet={facet}
            href={href({ price: facet.active ? null : facet.value })}
          />
        ))}
      </FilterGroup>
    </div>
  );
}

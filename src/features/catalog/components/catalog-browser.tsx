import Link from "next/link";

import { ActiveFilters } from "@/features/catalog/components/active-filters";
import { EmptyResults } from "@/features/catalog/components/empty-results";
import { FilterDrawer } from "@/features/catalog/components/filter-drawer";
import { FilterPanel } from "@/features/catalog/components/filter-panel";
import { ProductCard } from "@/features/catalog/components/product-card";
import { ProductRow } from "@/features/catalog/components/product-row";
import { SortSelect } from "@/features/catalog/components/sort-select";
import { ViewToggle } from "@/features/catalog/components/view-toggle";
import { Button } from "@/components/ui/button";
import {
  PAGE_SIZE,
  buildFacets,
  catalogHref,
  filterProducts,
  parseCatalogQuery,
  priceBuckets,
  sortProducts,
  type RawSearchParams,
} from "@/features/catalog/services/catalog";
import { STOCK_LABEL } from "@/features/catalog/services/product";
import type { Product } from "@/features/catalog/types";

/**
 * The filterable product listing: sidebar, toolbar, grid and pager.
 *
 * Extracted so `/products` and `/category/[slug]` are the same listing pointed
 * at different sets, rather than two implementations that drift apart. The
 * only differences a scoped listing needs are its own `basePath` — so every
 * facet link, sort change and "load more" stays on the category URL — and the
 * ability to drop the category facet, which is meaningless once the category
 * is fixed by the route.
 *
 * Everything here is server-rendered. The sort dropdown and the mobile filter
 * sheet are the only client components in the tree.
 */
export function CatalogBrowser({
  products,
  params,
  basePath = "/products",
  hideCategoryFacet = false,
  emptyMessage,
  emptyHeading,
}: {
  /** The set to browse — already scoped by the caller. */
  products: Product[];
  params: RawSearchParams;
  basePath?: string;
  hideCategoryFacet?: boolean;
  emptyMessage?: string;
  emptyHeading?: string;
}) {
  // Price bands come from the unfiltered set the page is browsing, so the
  // sidebar does not re-scale itself every time another filter is applied.
  const buckets = priceBuckets(products);
  const query = parseCatalogQuery(params);
  const facets = buildFacets(products, query, buckets, STOCK_LABEL);

  const matched = sortProducts(filterProducts(products, query, buckets), query.sort);
  const visible = matched.slice(0, query.shown);
  const hasMore = matched.length > visible.length;

  const activeCount =
    (hideCategoryFacet ? 0 : query.categories.length) +
    query.brands.length +
    query.stock.length +
    (query.price !== null ? 1 : 0) +
    (query.rating !== null ? 1 : 0) +
    (query.highlight !== "all" ? 1 : 0);

  const clearHref = catalogHref(
    {},
    { view: query.view === "list" ? "list" : null },
    basePath,
  );

  const sidebar = (
    <FilterPanel
      facets={facets}
      query={query}
      params={params}
      basePath={basePath}
      hideCategories={hideCategoryFacet}
    />
  );

  return (
    <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8">
      <aside className="hidden lg:block" aria-label="Product filters">
        {sidebar}
      </aside>

      <section aria-label="Products">
        {/* Counts describe the filtered set, not the catalogue, so the number
            always agrees with what is drawn underneath it. */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <FilterDrawer activeCount={activeCount}>{sidebar}</FilterDrawer>

            <p className="text-sm text-muted-foreground" aria-live="polite">
              {matched.length === 0
                ? "No results"
                : `Showing 1–${visible.length} of ${matched.length} ${
                    matched.length === 1 ? "result" : "results"
                  }`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SortSelect value={query.sort} />
            <ViewToggle view={query.view} params={params} basePath={basePath} />
          </div>
        </div>

        <ActiveFilters
          query={query}
          params={params}
          buckets={buckets}
          basePath={basePath}
          hideCategories={hideCategoryFacet}
        />

        {matched.length === 0 ? (
          <EmptyResults clearHref={clearHref} message={emptyMessage} heading={emptyHeading} />
        ) : (
          <>
            {query.view === "grid" ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {visible.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    tier="GUEST"
                    // Only the first row is above the fold on a desktop grid.
                    priority={index < 4}
                    showRating={false}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {visible.map((product) => (
                  <ProductRow key={product.id} product={product} tier="GUEST" />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <Button asChild size="lg" variant="outline" className="min-w-44">
                  <Link
                    href={catalogHref(
                      params,
                      { show: String(query.shown + PAGE_SIZE) },
                      basePath,
                    )}
                    scroll={false}
                  >
                    Load more
                  </Link>
                </Button>

                <p className="text-xs text-muted-foreground">
                  {visible.length} of {matched.length} shown
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

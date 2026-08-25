"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Flame,
  LayoutGrid,
  Percent,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { SectionCta } from "@/features/home/components/section-cta";
import { SectionHeading } from "@/features/home/components/section-heading";
import { ProductCard } from "@/features/catalog/components/product-card";
import { discountPercent } from "@/features/catalog/services/product";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type {
  CustomerTier,
  Product,
} from "@/features/catalog/types";

/**
 * Products overview — a tabbed carousel of curated slices, paged.
 *
 * Centred heading above, then a controls row of its own: tabs on the left,
 * paging arrows on the right. The heading names the section, the tabs say
 * what's in it, so neither has to do the other's job.
 *
 * The filter set is fixed rather than derived from the catalogue. "Trending"
 * and "Top Selling" reuse the same order-ranked lists the sections above this
 * one on the home page already compute (`getTrendingProducts` /
 * `getTopSellingProducts`) — pass them through as props. Without them the
 * component still degrades gracefully: "Trending" falls back to the
 * `TRENDING` badge on `Product`, and "Top Selling" simply has nothing to show
 * and drops out.
 *
 * Every other tab reads a field that already exists on `Product` — no schema
 * change, no new query: "New Arrivals" the `NEW` badge, "On Sale" a genuine
 * compare-at discount (or `CLEARANCE`), "Selling Fast" the low-stock state,
 * "Quote Only" the `isQuoteOnly` flag. "Featured" is the one approximation:
 * there's no editorial flag in the data model, so it stands in with anything
 * merchandising has badged at all, and should be pointed at a real flag once
 * one exists.
 *
 * A tab that can't fill a row drops out rather than rendering a broken grid,
 * so the visible set tracks whatever the catalogue actually supports.
 *
 * Toggle buttons rather than ARIA tabs, same reasoning as the original: this
 * genuinely narrows one list in place rather than switching between separate
 * panels, and `aria-pressed` says exactly that. Remounting on change (via
 * `key`) resets the carousel to page one, which is what you want after
 * narrowing the set.
 */
const PER_PAGE = 10;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

type FilterKey =
  | "all"
  | "trending"
  | "new"
  | "top-selling"
  | "featured"
  | "on-sale"
  | "selling-fast"
  | "quote-only";

const FILTER_META: Record<FilterKey, { label: string; icon: typeof LayoutGrid }> = {
  all: { label: "All", icon: LayoutGrid },
  trending: { label: "Trending", icon: TrendingUp },
  new: { label: "New Arrivals", icon: Sparkles },
  "top-selling": { label: "Top Selling", icon: Trophy },
  featured: { label: "Featured", icon: Star },
  "on-sale": { label: "On Sale", icon: Percent },
  // "Low stock" states a warehouse problem; "Selling Fast" states the same
  // fact as demand. Same filter, and the honest one to lead with when the
  // point is to get someone to order before it's gone.
  "selling-fast": { label: "Selling Fast", icon: Flame },
  "quote-only": { label: "Quote Only", icon: FileText },
};

const FILTER_ORDER: FilterKey[] = [
  "all",
  "trending",
  "new",
  "top-selling",
  "featured",
  "on-sale",
  "selling-fast",
  "quote-only",
];

export function TrendingProducts({
  products,
  trending,
  topSelling,
  tier = "GUEST",
  perFilter = 20,
  minPerFilter = 3,
}: {
  products: Product[];
  /** Order-ranked recent-window list from `getTrendingProducts()`. Falls back to the `TRENDING` badge when omitted. */
  trending?: Product[];
  /** Order-ranked all-time list from `getTopSellingProducts()`. Tab drops out when omitted. */
  topSelling?: Product[];
  tier?: CustomerTier;
  perFilter?: number;
  /** Minimum products before a slice earns its own tab. */
  minPerFilter?: number;
}) {
  const filters = useMemo(() => {
    const byBadge = (badge: NonNullable<Product["badge"]>) =>
      products.filter((product) => product.badge === badge);

    const items: Record<FilterKey, Product[]> = {
      all: products.slice(0, perFilter),
      trending: (trending?.length ? trending : byBadge("TRENDING")).slice(0, perFilter),
      new: byBadge("NEW").slice(0, perFilter),
      "top-selling": (topSelling ?? []).slice(0, perFilter),
      // Anything merchandising has tagged at all — the closest stand-in for an
      // editorial "featured" flag until the data model grows a real one.
      featured: products.filter((product) => product.badge !== null).slice(0, perFilter),
      "on-sale": products
        .filter(
          (product) =>
            discountPercent(product) !== null || product.badge === "CLEARANCE",
        )
        .slice(0, perFilter),
      "selling-fast": products
        .filter(
          (product) => product.stockStatus === "LOW_STOCK" || product.badge === "LOW_STOCK",
        )
        .slice(0, perFilter),
      "quote-only": products.filter((product) => product.isQuoteOnly).slice(0, perFilter),
    };

    return FILTER_ORDER.filter((key) => key === "all" || items[key].length >= minPerFilter).map(
      (key) => ({ key, items: items[key] }),
    );
  }, [products, trending, topSelling, perFilter, minPerFilter]);

  const [active, setActive] = useState<FilterKey>("all");

  const current = filters.find((f) => f.key === active) ?? filters[0];
  if (!current) return null;

  const pages = chunk(current.items, PER_PAGE);
  const multiPage = pages.length > 1;

  return (
    <section aria-labelledby="products-overview-heading">
      {/* `key` remounts the carousel when the filter changes so it starts at
          page one rather than stranding the viewer on an empty later page. */}
      <Carousel key={active} opts={{ align: "start", loop: multiPage }} className="w-full">
        <SectionHeading
          id="products-overview-heading"
          title="Products Overview"
          subtitle="Everything we stock, sliced the way you shop — what's moving, what's new, and what's on offer."
        />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
          <div
            role="group"
            aria-label="Filter products"
            className="w-full overflow-x-auto sm:w-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-white p-1.5 shadow-sm">
              {filters.map((filter) => {
                const meta = FILTER_META[filter.key];
                const isActive = active === filter.key;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActive(filter.key)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 sm:px-4 sm:text-sm",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <meta.icon className="size-3.5 sm:size-4" strokeWidth={2} aria-hidden="true" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {multiPage && (
            <div className="hidden items-center gap-2 sm:flex">
              <CarouselPrevious className="static size-10 translate-y-0 border-border/80 hover:border-primary hover:bg-primary hover:text-primary-foreground" />
              <CarouselNext className="static size-10 translate-y-0 border-border/80 hover:border-primary hover:bg-primary hover:text-primary-foreground" />
            </div>
          )}
        </div>

        <CarouselContent className="-ml-4">
          {pages.map((page, pageIndex) => (
            <CarouselItem key={pageIndex} className="pl-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {page.map((product) => (
                  <ProductCard key={product.id} product={product} tier={tier} />
                ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <SectionCta href="/products" />
    </section>
  );
}

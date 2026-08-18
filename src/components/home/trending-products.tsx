"use client";

import { useMemo, useState } from "react";
import { SectionCta } from "@/components/home/section-cta";
import { SectionHeading } from "@/components/home/section-heading";
import { ProductCard } from "@/components/product/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { CustomerTier, Product } from "@/types";

/**
 * Trending products — filtered by category, paged as a carousel.
 *
 * Same header pattern as the category carousel: title on the left, arrows on
 * the right of the same row. That requires a *single* carousel, so the filter
 * swaps the slides rather than each filter owning its own carousel — the
 * arrows can only belong to one.
 *
 * The filter is a group of toggle buttons rather than ARIA tabs. It genuinely
 * is a filter: it narrows one list in place instead of switching between
 * separate panels, and `aria-pressed` says exactly that. Remounting on change
 * (via `key`) resets the carousel to page one, which is what you want after
 * narrowing the set.
 */
const PER_PAGE = 10;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

const ALL = "All";

export function TrendingProducts({
  products,
  tier = "GUEST",
  title = "Trending products",
  subtitle,
  maxFilters = 4,
  perFilter = 20,
  minPerFilter = 3,
}: {
  products: Product[];
  tier?: CustomerTier;
  title?: string;
  subtitle?: string;
  maxFilters?: number;
  perFilter?: number;
  /** Minimum products before a category earns its own filter. */
  minPerFilter?: number;
}) {
  const filters = useMemo(() => {
    const byCategory = new Map<string, Product[]>();
    for (const product of products) {
      const bucket = byCategory.get(product.categoryName) ?? [];
      bucket.push(product);
      byCategory.set(product.categoryName, bucket);
    }

    // A filter yielding one product reads as a broken grid, so a category has
    // to carry enough stock to fill a row before it earns a button.
    const categories = [...byCategory.entries()]
      .filter(([, items]) => items.length >= minPerFilter)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, maxFilters)
      .map(([name, items]) => ({ name, items: items.slice(0, perFilter) }));

    return [{ name: ALL, items: products.slice(0, perFilter) }, ...categories];
  }, [products, maxFilters, perFilter, minPerFilter]);

  const [active, setActive] = useState(ALL);

  const current = filters.find((f) => f.name === active) ?? filters[0];
  if (!current) return null;

  const pages = chunk(current.items, PER_PAGE);
  const multiPage = pages.length > 1;

  return (
    <section aria-labelledby="trending-heading">
      {/* `key` remounts the carousel when the filter changes so it starts at
          page one rather than stranding the viewer on an empty later page. */}
      <Carousel key={active} opts={{ align: "start", loop: multiPage }} className="w-full">
        <SectionHeading
          id="trending-heading"
          align="start"
          title={title}
          subtitle={subtitle}
          actions={
            multiPage ? (
              <div className="hidden items-center gap-2 sm:flex">
                <CarouselPrevious className="static size-9 translate-y-0" />
                <CarouselNext className="static size-9 translate-y-0" />
              </div>
            ) : null
          }
        />

        {filters.length > 1 && (
          <div
            role="group"
            aria-label="Filter by category"
            className="-mt-4 mb-6 flex flex-wrap gap-2"
          >
            {filters.map((filter) => (
              <button
                key={filter.name}
                type="button"
                aria-pressed={active === filter.name}
                onClick={() => setActive(filter.name)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                  active === filter.name
                    ? "border-primary bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {filter.name}
              </button>
            ))}
          </div>
        )}

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

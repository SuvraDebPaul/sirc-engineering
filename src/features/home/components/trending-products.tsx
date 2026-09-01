"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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
  all: { label: "All Items", icon: LayoutGrid },
  trending: { label: "Trending", icon: TrendingUp },
  new: { label: "New Arrivals", icon: Sparkles },
  "top-selling": { label: "Top Selling", icon: Trophy },
  featured: { label: "Featured", icon: Star },
  "on-sale": { label: "On Sale", icon: Percent },
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
  trending?: Product[];
  topSelling?: Product[];
  tier?: CustomerTier;
  perFilter?: number;
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
    <section aria-labelledby="products-overview-heading" className="space-y-6">
      <Carousel key={active} opts={{ align: "start", loop: multiPage }} className="w-full">
        <SectionHeading
          id="products-overview-heading"
          title="Products Overview"
          subtitle="Precision instruments engineered for industrial testing, calibration, and power analysis."
        />

        {/* High-Contrast Tab Controls & Carousel Navigation */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
          <div
            role="group"
            aria-label="Filter products by collection"
            className="w-full overflow-x-auto sm:w-auto pb-1 sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card p-1.5 shadow-sm">
              {filters.map((filter) => {
                const meta = FILTER_META[filter.key];
                const isActive = active === filter.key;
                const count = filter.items.length;

                return (
                  <button
                    key={filter.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActive(filter.key)}
                    className={cn(
                      "group relative inline-flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200",
                      isActive
                        ? "text-white font-bold"
                        : "text-foreground/80 hover:text-foreground hover:bg-muted/70",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="trending-filter-pill"
                        className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/25"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}

                    <span className="relative z-10 inline-flex items-center gap-2">
                      <meta.icon
                        className={cn(
                          "size-4 shrink-0 transition-colors",
                          isActive ? "text-white" : "text-foreground/70 group-hover:text-primary",
                        )}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      <span className="font-semibold">{meta.label}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-mono font-bold transition-colors",
                          isActive
                            ? "bg-white/25 text-white border border-white/20 shadow-2xs"
                            : "bg-muted border border-border/70 text-foreground/80",
                        )}
                      >
                        {count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {multiPage && (
            <div className="hidden items-center gap-2 sm:flex">
              <CarouselPrevious className="static size-10 translate-y-0 border-border/80 hover:border-primary hover:bg-primary hover:text-primary-foreground shadow-xs transition-all" />
              <CarouselNext className="static size-10 translate-y-0 border-border/80 hover:border-primary hover:bg-primary hover:text-primary-foreground shadow-xs transition-all" />
            </div>
          )}
        </div>

        {/* Product Cards Grid */}
        <CarouselContent className="-ml-4">
          {pages.map((page, pageIndex) => (
            <CarouselItem key={pageIndex} className="pl-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {page.map((product) => (
                  <ProductCard key={product.id} product={product} tier={tier} />
                ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <SectionCta href="/products" label="Browse Full Inventory" />
    </section>
  );
}

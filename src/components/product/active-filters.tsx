import Link from "next/link";
import { X } from "lucide-react";

import {
  HIGHLIGHTS,
  catalogHref,
  hasActiveFilters,
  toggleValue,
  type CatalogQuery,
  type PriceBucket,
  type RawSearchParams,
} from "@/lib/catalog";
import { STOCK_LABEL } from "@/lib/product";

/**
 * Removable chips for whatever is currently narrowing the catalogue.
 *
 * The sidebar shows what *could* be applied; this shows what *is*, in one row,
 * without scrolling six groups to find the one stray checkbox responsible for
 * an empty page. Each chip is a link that removes exactly its own filter.
 */
type Chip = { key: string; label: string; href: string };

export function ActiveFilters({
  query,
  params,
  buckets,
  basePath = "/products",
  hideCategories = false,
}: {
  query: CatalogQuery;
  params: RawSearchParams;
  buckets: PriceBucket[];
  basePath?: string;
  hideCategories?: boolean;
}) {
  const href = (changes: Record<string, string | null>) => catalogHref(params, changes, basePath);
  if (!hasActiveFilters(query)) return null;

  const chips: Chip[] = [];

  if (query.q !== "") {
    chips.push({
      key: "q",
      label: `Search: “${query.q}”`,
      href: href({ q: null }),
    });
  }

  if (query.highlight !== "all") {
    const highlight = HIGHLIGHTS.find((entry) => entry.value === query.highlight);
    if (highlight) {
      chips.push({
        key: "highlight",
        label: highlight.label,
        href: href({ highlight: null }),
      });
    }
  }

  for (const category of hideCategories ? [] : query.categories) {
    chips.push({
      key: `category-${category}`,
      label: category,
      href: href({ category: toggleValue(query.categories, category) }),
    });
  }

  for (const brand of query.brands) {
    chips.push({
      key: `brand-${brand}`,
      label: brand,
      href: href({ brand: toggleValue(query.brands, brand) }),
    });
  }

  for (const status of query.stock) {
    chips.push({
      key: `stock-${status}`,
      label: STOCK_LABEL[status],
      href: href({ stock: toggleValue(query.stock, status) }),
    });
  }

  if (query.price !== null) {
    const bucket = buckets[query.price];
    if (bucket) {
      chips.push({
        key: "price",
        label: bucket.label,
        href: href({ price: null }),
      });
    }
  }

  if (query.rating !== null) {
    chips.push({
      key: "rating",
      label: `${query.rating}★ & up`,
      href: href({ rating: null }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Filtered by:</span>

      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          scroll={false}
          aria-label={`Remove filter: ${chip.label}`}
          className="inline-flex items-center gap-1.5 rounded-full border bg-card py-1 pl-3 pr-2 text-sm transition-colors hover:border-destructive/50 hover:text-destructive"
        >
          {chip.label}
          <X className="size-3.5" aria-hidden="true" />
        </Link>
      ))}

      <Link
        href={catalogHref({}, { view: query.view === "list" ? "list" : null }, basePath)}
        scroll={false}
        className="ml-1 text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Clear all
      </Link>
    </div>
  );
}

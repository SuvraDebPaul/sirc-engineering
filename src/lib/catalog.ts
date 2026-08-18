import { discountPercent } from "@/lib/product";
import type { SortValue } from "@/lib/product";
import type { Product, StockStatus } from "@/types";

/**
 * Catalogue querying — filtering, sorting and facet counting.
 *
 * Pure functions over an array, with no React and no data source of its own.
 * The listing page reads the URL, hands the params here, and renders what comes
 * back; swapping the demo array for a database query later means rewriting
 * `lib/api/products.ts`, not this file.
 *
 * Every filter lives in the query string rather than component state. That
 * makes a filtered listing shareable, bookmarkable and back-button friendly,
 * and it lets the whole sidebar stay a server component — the facets are plain
 * links, so narrowing the catalogue costs no client JavaScript at all.
 */

export type ViewMode = "grid" | "list";

export const HIGHLIGHTS = [
  { value: "all", label: "All products" },
  { value: "best-sellers", label: "Best sellers" },
  { value: "new", label: "New arrivals" },
  { value: "sale", label: "On offer" },
  { value: "trending", label: "Trending" },
] as const;

export type Highlight = (typeof HIGHLIGHTS)[number]["value"];

export const STOCK_ORDER: StockStatus[] = [
  "IN_STOCK",
  "LOW_STOCK",
  "MADE_TO_ORDER",
  "OUT_OF_STOCK",
];

/** Ratings offered as "and up" thresholds, high to low, like the reference. */
export const RATING_THRESHOLDS = [5, 4, 3, 2, 1] as const;

/** Products per page. "Load more" raises the count in the URL. */
export const PAGE_SIZE = 12;

export interface CatalogQuery {
  categories: string[];
  brands: string[];
  stock: StockStatus[];
  /** Index into the bucket list from `priceBuckets`, or null for any price. */
  price: number | null;
  /** Minimum average rating. */
  rating: number | null;
  highlight: Highlight;
  sort: SortValue;
  view: ViewMode;
  /** How many results to render — grows as "load more" is followed. */
  shown: number;
  q: string;
}

export interface Facet {
  value: string;
  label: string;
  count: number;
  active: boolean;
}

export interface PriceBucket {
  label: string;
  /** Inclusive lower bound, in poisha. */
  min: number;
  /** Exclusive upper bound, in poisha. `Infinity` on the open-ended top band. */
  max: number;
}

/**
 * The price a filter or sort should use.
 *
 * A product sold as a range is judged on its cheapest variant — that is the
 * number the shopper saw on the card, so filtering on anything else would drop
 * items out of a band they visibly belong to. Quote-only products have no
 * price at all and are excluded from price filtering rather than treated as
 * free.
 */
export const effectivePrice = (product: Product): number | null => {
  if (product.isQuoteOnly) return null;
  return product.priceMin ?? product.retailPrice;
};

const SORT_VALUES = new Set<string>([
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
]);

const asArray = (value: string | string[] | undefined): string[] => {
  if (value === undefined) return [];
  // Repeated params arrive as an array; a single param may still hold a
  // comma-joined list, which is how the facet links write them.
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export type RawSearchParams = Record<string, string | string[] | undefined>;

/**
 * Read the URL into a query object.
 *
 * Everything is validated against the known vocabulary. A hand-edited URL
 * asking for `?sort=cheapest` or `?rating=99` falls back to the default rather
 * than rendering an empty page or throwing.
 */
export const parseCatalogQuery = (params: RawSearchParams): CatalogQuery => {
  const highlight = first(params.highlight);
  const sort = first(params.sort);
  const price = Number(first(params.price));
  const rating = Number(first(params.rating));
  const shown = Number(first(params.show));

  return {
    categories: asArray(params.category),
    brands: asArray(params.brand),
    stock: asArray(params.stock).filter((value): value is StockStatus =>
      (STOCK_ORDER as string[]).includes(value),
    ),
    price: Number.isInteger(price) && price >= 0 ? price : null,
    rating: RATING_THRESHOLDS.includes(rating as (typeof RATING_THRESHOLDS)[number])
      ? rating
      : null,
    highlight: HIGHLIGHTS.some((entry) => entry.value === highlight)
      ? (highlight as Highlight)
      : "all",
    sort: SORT_VALUES.has(sort ?? "") ? (sort as SortValue) : "featured",
    view: first(params.view) === "list" ? "list" : "grid",
    shown: Number.isFinite(shown) && shown >= PAGE_SIZE ? Math.floor(shown) : PAGE_SIZE,
    q: (first(params.q) ?? "").trim(),
  };
};

/**
 * Even price bands spanning the catalogue.
 *
 * Derived from the data rather than hardcoded, so adding a ৳2,000,000
 * instrument re-bands the sidebar instead of stranding it in a "৳500,000+"
 * catch-all forever. The step is rounded up to a 1/2/5 × 10ⁿ figure so the
 * labels read as round numbers.
 */
export const priceBuckets = (products: Product[], bands = 5): PriceBucket[] => {
  const prices = products.map(effectivePrice).filter((value): value is number => value !== null);
  if (prices.length === 0) return [];

  const max = Math.max(...prices);
  const rough = max / bands;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= rough) ?? magnitude * 10;

  const format = (poisha: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(poisha / 100);

  return Array.from({ length: bands }, (_, index) => {
    const min = index * step;
    const isLast = index === bands - 1;
    return {
      label: isLast ? `${format(min)}+` : `${format(min)} – ${format(min + step)}`,
      min,
      max: isLast ? Infinity : min + step,
    };
  });
};

/** Each filter as a standalone predicate, so facet counting can skip one group. */
type Predicates = Record<"categories" | "brands" | "stock" | "price" | "rating" | "highlight" | "q", (product: Product) => boolean>;

const buildPredicates = (query: CatalogQuery, buckets: PriceBucket[]): Predicates => {
  const bucket = query.price !== null ? buckets[query.price] : undefined;
  const needle = query.q.toLowerCase();

  return {
    categories: (p) => query.categories.length === 0 || query.categories.includes(p.categoryName),
    brands: (p) => query.brands.length === 0 || query.brands.includes(p.brand),
    stock: (p) => query.stock.length === 0 || query.stock.includes(p.stockStatus),
    price: (p) => {
      if (!bucket) return true;
      const value = effectivePrice(p);
      return value !== null && value >= bucket.min && value < bucket.max;
    },
    rating: (p) => query.rating === null || (p.rating !== null && p.rating >= query.rating),
    highlight: (p) => {
      switch (query.highlight) {
        case "best-sellers":
          return p.rating !== null && p.rating >= 4.6;
        case "new":
          return p.badge === "NEW";
        case "sale":
          return discountPercent(p) !== null;
        case "trending":
          return p.badge === "TRENDING";
        default:
          return true;
      }
    },
    q: (p) => {
      if (needle === "") return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.brand.toLowerCase().includes(needle) ||
        p.modelNumber.toLowerCase().includes(needle) ||
        p.categoryName.toLowerCase().includes(needle)
      );
    },
  };
};

/**
 * Apply every filter except the named groups.
 *
 * Skipping a group is what makes facet counts honest: the number beside
 * "Fluke" is how many results you would get by *adding* Fluke, which means
 * counting with the other brands' own filter lifted. Counting with it applied
 * would show every unselected brand as zero.
 */
const applyExcept = (
  products: Product[],
  predicates: Predicates,
  ...skip: (keyof Predicates)[]
): Product[] => {
  const keys = (Object.keys(predicates) as (keyof Predicates)[]).filter((key) => !skip.includes(key));
  return products.filter((product) => keys.every((key) => predicates[key](product)));
};

export const filterProducts = (products: Product[], query: CatalogQuery, buckets: PriceBucket[]): Product[] =>
  applyExcept(products, buildPredicates(query, buckets));

/**
 * Order the results.
 *
 * Products without a price sort last on both price directions — a quote-only
 * instrument is not the cheapest thing in the catalogue, and putting it at the
 * top of "price: low to high" would be actively misleading.
 *
 * "Newest" has no date field to work with, so it leans on the NEW badge and
 * otherwise keeps the curated order. Sorting is never done in place: the
 * caller's array is the shared module-level demo data.
 */
export const sortProducts = (products: Product[], sort: SortValue): Product[] => {
  const items = [...products];

  switch (sort) {
    case "price-asc":
    case "price-desc": {
      const direction = sort === "price-asc" ? 1 : -1;
      return items.sort((a, b) => {
        const left = effectivePrice(a);
        const right = effectivePrice(b);
        if (left === null && right === null) return 0;
        if (left === null) return 1;
        if (right === null) return -1;
        return (left - right) * direction;
      });
    }
    case "name-asc":
      return items.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
      return items.sort((a, b) => Number(b.badge === "NEW") - Number(a.badge === "NEW"));
    default:
      return items;
  }
};

const countBy = (products: Product[], pick: (product: Product) => string): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const product of products) {
    const key = pick(product);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};

export interface Facets {
  categories: Facet[];
  brands: Facet[];
  stock: Facet[];
  prices: (Facet & { index: number })[];
  ratings: (Facet & { threshold: number })[];
  highlights: Facet[];
}

/**
 * Counts for every sidebar option, each measured with its own group's filter
 * lifted. Options that would return nothing still render, greyed out, so the
 * sidebar does not reshuffle under the cursor as filters are applied.
 */
export const buildFacets = (
  products: Product[],
  query: CatalogQuery,
  buckets: PriceBucket[],
  stockLabels: Record<StockStatus, string>,
): Facets => {
  const predicates = buildPredicates(query, buckets);

  const categoryPool = applyExcept(products, predicates, "categories");
  const brandPool = applyExcept(products, predicates, "brands");
  const stockPool = applyExcept(products, predicates, "stock");
  const pricePool = applyExcept(products, predicates, "price");
  const ratingPool = applyExcept(products, predicates, "rating");
  const highlightPool = applyExcept(products, predicates, "highlight");

  const categoryCounts = countBy(categoryPool, (p) => p.categoryName);
  const brandCounts = countBy(brandPool, (p) => p.brand);
  const stockCounts = countBy(stockPool, (p) => p.stockStatus);

  // Names come from the full catalogue, not the filtered pool, so an option
  // never vanishes mid-session and leave the shopper unable to widen again.
  const allCategories = [...new Set(products.map((p) => p.categoryName))].sort();
  const allBrands = [...new Set(products.map((p) => p.brand))].sort();

  const highlightCounts = new Map<string, number>(
    HIGHLIGHTS.map(({ value }) => {
      const scoped = buildPredicates({ ...query, highlight: value }, buckets).highlight;
      return [value, highlightPool.filter(scoped).length];
    }),
  );

  return {
    categories: allCategories.map((name) => ({
      value: name,
      label: name,
      count: categoryCounts.get(name) ?? 0,
      active: query.categories.includes(name),
    })),
    brands: allBrands.map((name) => ({
      value: name,
      label: name,
      count: brandCounts.get(name) ?? 0,
      active: query.brands.includes(name),
    })),
    stock: STOCK_ORDER.map((status) => ({
      value: status,
      label: stockLabels[status],
      count: stockCounts.get(status) ?? 0,
      active: query.stock.includes(status),
    })),
    prices: buckets.map((bucket, index) => ({
      index,
      value: String(index),
      label: bucket.label,
      count: pricePool.filter((product) => {
        const value = effectivePrice(product);
        return value !== null && value >= bucket.min && value < bucket.max;
      }).length,
      active: query.price === index,
    })),
    ratings: RATING_THRESHOLDS.map((threshold) => ({
      threshold,
      value: String(threshold),
      label: `${threshold} star${threshold === 1 ? "" : "s"} & up`,
      count: ratingPool.filter((p) => p.rating !== null && p.rating >= threshold).length,
      active: query.rating === threshold,
    })),
    highlights: HIGHLIGHTS.map(({ value, label }) => ({
      value,
      label,
      count: highlightCounts.get(value) ?? 0,
      active: query.highlight === value,
    })),
  };
};

/**
 * Build an href with some params changed.
 *
 * `null` removes a param. Any change to the filters resets `show`, because
 * carrying "load more" across a narrowing would render a page of results the
 * shopper never asked to expand.
 *
 * `basePath` lets the same controls drive a scoped listing — a category page
 * keeps its own URL while reusing every facet link, sort option and pager.
 */
export const catalogHref = (
  current: RawSearchParams,
  changes: Record<string, string | null>,
  basePath = "/products",
): string => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    if (value === undefined) continue;
    for (const entry of Array.isArray(value) ? value : [value]) {
      if (entry !== "") params.append(key, entry);
    }
  }

  for (const [key, value] of Object.entries(changes)) {
    params.delete(key);
    if (value !== null) params.set(key, value);
  }

  if (!("show" in changes)) params.delete("show");

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
};

/** Toggle one value inside a comma-joined multi-select param. */
export const toggleValue = (selected: string[], value: string): string | null => {
  const next = selected.includes(value)
    ? selected.filter((entry) => entry !== value)
    : [...selected, value];
  return next.length > 0 ? next.join(",") : null;
};

/** Whether anything is narrowing the catalogue, for the "clear all" control. */
export const hasActiveFilters = (query: CatalogQuery): boolean =>
  query.categories.length > 0 ||
  query.brands.length > 0 ||
  query.stock.length > 0 ||
  query.price !== null ||
  query.rating !== null ||
  query.highlight !== "all" ||
  query.q !== "";

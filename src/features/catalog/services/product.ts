import type {
  CustomerTier,
  PriceDisplay,
  Product,
  ProductBadge,
  StockStatus,
} from "@/features/catalog/types";

/**
 * Product display rules.
 *
 * Pricing visibility is a business rule, not a styling choice, so it is decided
 * here once and the cards just render the result.
 */

/**
 * Decide what the price area shows.
 *
 * Prices are public — there is no signed-out gate. Hiding the number behind a
 * login costs more enquiries than it protects margin, and a buyer comparing
 * four insulation testers will simply go elsewhere.
 *
 * Order matters: an explicit quote-only flag wins, then a variant range, then
 * contract pricing for signed-in B2B accounts, then retail. Anything with no
 * price at all falls through to "quote", which routes to the RFQ form.
 */
export const resolvePriceDisplay = (product: Product, tier: CustomerTier): PriceDisplay => {
  if (product.isQuoteOnly) return { kind: "quote" };

  if (product.priceMin !== null && product.priceMax !== null) {
    return { kind: "range", min: product.priceMin, max: product.priceMax };
  }

  if (tier === "B2B" && product.tierPrice !== null) {
    return {
      kind: "price",
      amount: product.tierPrice,
      compareAt: product.retailPrice,
      note: "Your contract price",
    };
  }

  if (product.retailPrice === null) return { kind: "quote" };

  const compareAt =
    product.compareAtPrice !== null && product.compareAtPrice > product.retailPrice
      ? product.compareAtPrice
      : null;

  return { kind: "price", amount: product.retailPrice, compareAt };
};

/**
 * Saving as a whole percentage, for the corner badge.
 *
 * Returns null when there is nothing genuine to advertise: a compare-at price
 * at or below the live price is bad data rather than a discount, and rounding
 * down to zero would put a meaningless "-0%" on the card.
 */
export const discountPercent = (product: Product): number | null => {
  const live = product.retailPrice;
  const was = product.compareAtPrice;
  if (live === null || was === null || was <= live) return null;

  const percent = Math.round(((was - live) / was) * 100);
  return percent > 0 ? percent : null;
};

export const STOCK_LABEL: Record<StockStatus, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  MADE_TO_ORDER: "Made to order",
  OUT_OF_STOCK: "Out of stock",
};

/**
 * Status dot colours. Paired with `STOCK_LABEL` everywhere they're used —
 * colour is never the only signal, so the state survives colour blindness and
 * greyscale printing.
 */
export const STOCK_DOT: Record<StockStatus, string> = {
  IN_STOCK: "bg-emerald-500",
  LOW_STOCK: "bg-amber-500",
  MADE_TO_ORDER: "bg-sky-500",
  OUT_OF_STOCK: "bg-rose-500",
};

export const BADGE_LABEL: Record<NonNullable<ProductBadge>, string> = {
  NEW: "New",
  TRENDING: "Trending",
  LOW_STOCK: "Low Stock",
  CLEARANCE: "Clearance",
};

/** Soft-tinted pills matching the reference design. */
export const BADGE_CLASS: Record<NonNullable<ProductBadge>, string> = {
  NEW: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-900",
  TRENDING:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
  LOW_STOCK:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  CLEARANCE:
    "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-900",
};

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

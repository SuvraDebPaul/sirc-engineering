import type { IconName } from "@/lib/icons";

/**
 * Product domain types.
 *
 * Types only — no data, no helpers. Demo records live in `src/data`, display
 * logic in `src/lib/product.ts`. Keeping them apart means swapping the demo
 * data for a real API changes one folder, not this file.
 */
export type CustomerTier = "GUEST" | "RETAIL" | "B2B";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "MADE_TO_ORDER" | "OUT_OF_STOCK";

export type ProductBadge = "NEW" | "TRENDING" | "LOW_STOCK" | "CLEARANCE" | null;

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  modelNumber: string;
  imageUrl: string | null;
  categoryName: string;
  categoryIcon: IconName;
  /** Secondary tag shown after the middot, e.g. "Calibration". */
  subCategoryName: string | null;
  badge: ProductBadge;
  /** Price in poisha (smallest unit). Avoids float rounding on money. */
  retailPrice: number | null;
  /** Was-price for strikethrough. Ignored unless greater than the live price. */
  compareAtPrice: number | null;
  /** Tier-specific price resolved server-side. Null when not entitled. */
  tierPrice: number | null;
  /** Set when the product has variants spanning a price range. */
  priceMin: number | null;
  priceMax: number | null;
  stockStatus: StockStatus;
  isQuoteOnly: boolean;
  /** Null until there is a review system — the card hides the row entirely. */
  rating: number | null;
  reviewCount: number;
}

/**
 * What the price area should render, decided once rather than in JSX.
 *
 * There is no signed-out variant: prices are public. A product with no price
 * falls to `quote`, which sends the visitor to the RFQ form rather than to a
 * login wall.
 */
export type PriceDisplay =
  | { kind: "price"; amount: number; compareAt: number | null; note?: string }
  | { kind: "range"; min: number; max: number }
  | { kind: "quote" };

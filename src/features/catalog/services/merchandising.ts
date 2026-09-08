import { cache } from "react";
import { unstable_cache } from "next/cache";

import { CACHE_DURATION_SECONDS, CACHE_TAGS } from "@/lib/cache";
import { prisma } from "@/lib/db/prisma";
import type { Product } from "@/features/catalog/types";

import { getProducts } from "./products";

/**
 * Rank products by units actually sold, not by anything editorial.
 *
 * Cancelled orders don't count — an order nobody actually took delivery of
 * says nothing about what sells. Products are still resolved through
 * `getProducts()` rather than the raw aggregate, so a discontinued product
 * that used to sell well can't surface here once it's gone from the
 * catalogue.
 */
/**
 * The aggregate itself, cached.
 *
 * Both strips on the home page run one of these, so without this every page
 * view paid for two `GROUP BY`s over `order_items` — the only queries left
 * touching the database once the catalogue reads were cached. Keyed by
 * window, since "all time" and "last 14 days" are different results.
 *
 * `since` is passed as a day string rather than a `Date`: `unstable_cache`
 * keys on the arguments, and a millisecond-precision timestamp would be a
 * different key on every single request, caching nothing.
 */
const rankedIds = unstable_cache(
  async (sinceDay: string | null, limit: number): Promise<string[]> => {
    const rows = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        productId: { not: null },
        order: {
          status: { not: "CANCELLED" },
          ...(sinceDay ? { createdAt: { gte: new Date(sinceDay) } } : {}),
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    return rows.map((row) => row.productId).filter((id): id is string => id !== null);
  },
  ["ranked-product-ids"],
  { tags: [CACHE_TAGS.catalog], revalidate: CACHE_DURATION_SECONDS },
);

async function rankByQuantitySold(
  sinceDay: string | null,
  limit: number,
): Promise<Product[]> {
  const ids = await rankedIds(sinceDay, limit);
  if (ids.length === 0) return [];

  // `getProducts()` is cached across requests and deduped within one, so
  // resolving through it costs nothing here — the two merchandising strips
  // on the home page share the same catalogue read as the rest of the page.
  const products = await getProducts();
  const byId = new Map(products.map((product) => [product.id, product]));

  return ids.flatMap((id) => {
    const product = byId.get(id);
    return product ? [product] : [];
  });
}

/** Best-selling products of all time, by total quantity ordered. */
export const getTopSellingProducts = cache(
  (limit = 10): Promise<Product[]> => rankByQuantitySold(null, limit),
);

/** Best-selling products within a recent window — momentum, not history. */
export const getTrendingProducts = cache(
  (days = 14, limit = 10): Promise<Product[]> => {
    // Truncated to the day, so the cache key is stable for 24 hours rather
    // than unique to the millisecond the request happened to arrive.
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    return rankByQuantitySold(since, limit);
  },
);

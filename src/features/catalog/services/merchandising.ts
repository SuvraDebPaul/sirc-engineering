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
async function rankByQuantitySold(
  since: Date | null,
  limit: number,
): Promise<Product[]> {
  const rows = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      productId: { not: null },
      order: {
        status: { not: "CANCELLED" },
        ...(since ? { createdAt: { gte: since } } : {}),
      },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const ids = rows.map((row) => row.productId).filter((id): id is string => id !== null);
  if (ids.length === 0) return [];

  const products = await getProducts();
  const byId = new Map(products.map((product) => [product.id, product]));

  return ids.flatMap((id) => {
    const product = byId.get(id);
    return product ? [product] : [];
  });
}

/** Best-selling products of all time, by total quantity ordered. */
export async function getTopSellingProducts(limit = 10): Promise<Product[]> {
  return rankByQuantitySold(null, limit);
}

/** Best-selling products within a recent window — momentum, not history. */
export async function getTrendingProducts(days = 14, limit = 10): Promise<Product[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return rankByQuantitySold(since, limit);
}

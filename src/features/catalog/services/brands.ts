import { prisma } from "@/lib/db/prisma";
import type { Brand, Product } from "@/features/catalog/types";

import { getProducts } from "./products";

const toBrand = (row: { id: string; name: string; logoUrl: string }): Brand => ({
  id: row.id,
  name: row.name,
  logoUrl: row.logoUrl,
});

export async function getBrands(): Promise<Brand[]> {
  const rows = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  return rows.map(toBrand);
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const row = await prisma.brand.findUnique({ where: { id } });
  return row ? toBrand(row) : null;
}

/**
 * Products carried for a brand.
 *
 * Matched on the brand's display name, which is what products store. Brand
 * ids and product brand strings are maintained separately, so comparing them
 * directly would silently return nothing the first time an id was renamed.
 */
export async function getProductsByBrand(brand: Brand): Promise<Product[]> {
  const products = await getProducts();
  const target = brand.name.toLowerCase().trim();
  return products.filter((product) => product.brand.toLowerCase().trim() === target);
}

/** Product count per brand name. */
export async function getBrandCounts(): Promise<Record<string, number>> {
  const products = await getProducts();
  const counts: Record<string, number> = {};
  for (const product of products) {
    counts[product.brand] = (counts[product.brand] ?? 0) + 1;
  }
  return counts;
}

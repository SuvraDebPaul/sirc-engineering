import { cache } from "react";
import { unstable_cache } from "next/cache";

import { CACHE_DURATION_SECONDS, CACHE_TAGS } from "@/lib/cache";
import { prisma } from "@/lib/db/prisma";
import type { Brand, Product } from "@/features/catalog/types";

import { getProducts } from "./products";

const toBrand = (row: { id: string; name: string; logoUrl: string }): Brand => ({
  id: row.id,
  name: row.name,
  logoUrl: row.logoUrl,
});

const readBrands = unstable_cache(
  async (): Promise<Brand[]> => {
    const rows = await prisma.brand.findMany({ orderBy: { name: "asc" } });
    return rows.map(toBrand);
  },
  ["brands-list"],
  { tags: [CACHE_TAGS.catalog], revalidate: CACHE_DURATION_SECONDS },
);

export const getBrands = cache((): Promise<Brand[]> => readBrands());

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

const readBrandCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    // Aggregate on the indexed `brandId` rather than counting a full
    // catalogue fetch in JS — see the matching note in `categories.ts`.
    const [grouped, brands] = await Promise.all([
      prisma.product.groupBy({ by: ["brandId"], _count: true }),
      readBrands(),
    ]);

    const nameById = new Map(brands.map((brand) => [brand.id, brand.name]));
    const counts: Record<string, number> = {};

    for (const row of grouped) {
      const name = nameById.get(row.brandId);
      if (name) counts[name] = row._count;
    }

    return counts;
  },
  ["brand-counts"],
  { tags: [CACHE_TAGS.catalog], revalidate: CACHE_DURATION_SECONDS },
);

/** Product count per brand name. */
export const getBrandCounts = cache((): Promise<Record<string, number>> => readBrandCounts());

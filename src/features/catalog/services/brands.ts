import { BRANDS } from "@/data";
import type {
  Brand,
  Product,
} from "@/features/catalog/types";

import { getProducts } from "./products";

/** See the note in `products.ts` on why these read directly rather than fetch. */
export async function getBrands(): Promise<Brand[]> {
  return BRANDS;
}

export async function getBrandById(id: string): Promise<Brand | null> {
  return BRANDS.find((brand) => brand.id === id) ?? null;
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

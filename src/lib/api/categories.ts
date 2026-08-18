import { CATEGORIES } from "@/data";
import type { Category, Product } from "@/types";

import { getProducts } from "./products";

/** See the note in `products.ts` on why these read directly rather than fetch. */
export async function getCategories(): Promise<Category[]> {
  return CATEGORIES;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

/**
 * Products belonging to a category.
 *
 * Matched on the category's **name**, not a slugified comparison. Every one of
 * the eight stocked categories matches its record exactly this way, whereas
 * slugifying quietly fails: "Measuring & Marking Tools" slugifies to
 * `measuring-and-marking-tools` while the record's slug is
 * `measuring-and-marking`, so a slug-based match would drop that category's
 * products on the floor.
 *
 * Comparison is normalised for case and spacing only, so a stray double space
 * in the data does not break the join.
 */
export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const target = normaliseName(category.name);
  const products = await getProducts();
  return products.filter((product) => normaliseName(product.categoryName) === target);
}

const normaliseName = (value: string): string => value.toLowerCase().replace(/\s+/g, " ").trim();

/** How many products each category holds, keyed by category name. */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const products = await getProducts();
  const counts: Record<string, number> = {};
  for (const product of products) {
    counts[product.categoryName] = (counts[product.categoryName] ?? 0) + 1;
  }
  return counts;
}

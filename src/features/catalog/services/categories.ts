import { prisma } from "@/lib/db/prisma";
import type { IconName } from "@/lib/icons";
import type { Category, Product } from "@/features/catalog/types";

import { getProducts } from "./products";

const toCategory = (row: {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string | null;
  parentId: string | null;
}): Category => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  icon: row.icon as IconName,
  imageUrl: row.imageUrl ?? undefined,
  parentId: row.parentId,
});

export async function getCategories(): Promise<Category[]> {
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return rows.map(toCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const row = await prisma.category.findUnique({ where: { slug } });
  return row ? toCategory(row) : null;
}

/** The direct subcategories of a category — one level, not the whole subtree. */
export async function getSubcategories(categoryId: string): Promise<Category[]> {
  const categories = await getCategories();
  return categories.filter((entry) => entry.parentId === categoryId);
}

export interface CategoryNode extends Category {
  children: Category[];
}

/** Every category grouped under its top-level parent — one level deep, for menus. */
export async function getCategoryTree(): Promise<CategoryNode[]> {
  const categories = await getCategories();
  const byParent = new Map<string, Category[]>();

  for (const category of categories) {
    if (category.parentId === null) continue;
    const bucket = byParent.get(category.parentId) ?? [];
    bucket.push(category);
    byParent.set(category.parentId, bucket);
  }

  return categories
    .filter((category) => category.parentId === null)
    .map((category) => ({ ...category, children: byParent.get(category.id) ?? [] }));
}

/**
 * Products belonging to a category.
 *
 * Matched on **name**, not a slugified comparison — the same
 * "Measuring & Marking Tools" mismatch this note has always warned about
 * still applies now that the name comes from the database instead of demo
 * data. Comparison is normalised for case and spacing only.
 *
 * A category with subcategories includes their products too — the taxonomy
 * is organisational (a parent like "Instruments" typically holds nothing
 * itself; the actual stock sits on its subcategories), so browsing the
 * parent should show everything beneath it, not an empty page.
 */
export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const children = await getSubcategories(category.id);
  const targets = new Set(
    [category.name, ...children.map((child) => child.name)].map(normaliseName),
  );
  const products = await getProducts();
  return products.filter((product) => targets.has(normaliseName(product.categoryName)));
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

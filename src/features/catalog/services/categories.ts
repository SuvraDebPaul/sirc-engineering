import { cache } from "react";
import { unstable_cache } from "next/cache";

import { CACHE_DURATION_SECONDS, CACHE_TAGS } from "@/lib/cache";
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

const readCategories = unstable_cache(
  async (): Promise<Category[]> => {
    const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return rows.map(toCategory);
  },
  ["categories-list"],
  { tags: [CACHE_TAGS.catalog], revalidate: CACHE_DURATION_SECONDS },
);

export const getCategories = cache((): Promise<Category[]> => readCategories());

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

const readCategoryCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    // `groupBy` on the indexed `categoryId` foreign key, rather than pulling
    // every product row into memory to tally them in JS. The header renders
    // these counts on every page, so the difference is one small aggregate
    // against a full table scan of the catalogue.
    const [grouped, categories] = await Promise.all([
      prisma.product.groupBy({ by: ["categoryId"], _count: true }),
      readCategories(),
    ]);

    const nameById = new Map(categories.map((category) => [category.id, category.name]));
    const counts: Record<string, number> = {};

    for (const row of grouped) {
      const name = nameById.get(row.categoryId);
      if (name) counts[name] = row._count;
    }

    return counts;
  },
  ["category-counts"],
  { tags: [CACHE_TAGS.catalog], revalidate: CACHE_DURATION_SECONDS },
);

/** How many products each category holds, keyed by category name. */
export const getCategoryCounts = cache(
  (): Promise<Record<string, number>> => readCategoryCounts(),
);

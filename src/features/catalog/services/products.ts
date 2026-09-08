import { cache } from "react";
import { unstable_cache } from "next/cache";

import { CACHE_DURATION_SECONDS, CACHE_TAGS } from "@/lib/cache";
import { prisma } from "@/lib/db/prisma";
import type { IconName } from "@/lib/icons";
import type {
  Product,
  ProductBadge,
  ProductDetail,
  ProductDocument,
  ProductImage,
  ProductSection,
  ProductWithDetail,
  SpecRow,
  StockStatus,
} from "@/features/catalog/types";

/**
 * Product reads.
 *
 * These read the database directly through Prisma — there is no separate API
 * hop, because these run on the server and Next's own guidance is explicit:
 * do not call Route Handlers from Server Components. The route handlers under
 * `app/api` stay: they serve this same data to Client Components and any
 * external consumer, and call these same functions rather than duplicating
 * the query.
 */
const include = { category: true, brand: true } as const;

/**
 * The columns a listing actually renders.
 *
 * `Product` carries seven JSON blob columns — `overview`, `highlights`,
 * `sections`, `specs`, `images`, `documents`, `shipping` — that only the
 * single-product detail page ever reads. A bare `findMany` fetched all of
 * them for every product, and this query runs on every public page (the
 * cart, the header, the home page). Naming the columns keeps the row small;
 * `fetchProductRows` below still selects everything for the detail page.
 */
export const listSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  modelNumber: true,
  imageUrl: true,
  subCategoryName: true,
  badge: true,
  retailPrice: true,
  compareAtPrice: true,
  priceMin: true,
  priceMax: true,
  stockStatus: true,
  isQuoteOnly: true,
  rating: true,
  reviewCount: true,
  category: { select: { name: true, icon: true } },
  brand: { select: { name: true } },
} as const;

async function fetchProductListRows() {
  return prisma.product.findMany({
    select: listSelect,
    orderBy: { createdAt: "desc" },
  });
}

/** The one place that genuinely needs every column, blobs included. */
async function fetchProductDetailRow(slug: string) {
  return prisma.product.findUnique({ where: { slug }, include });
}

type ProductRow = Awaited<ReturnType<typeof fetchProductListRows>>[number];
type DetailRow = NonNullable<Awaited<ReturnType<typeof fetchProductDetailRow>>>;

export const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  brand: row.brand.name,
  modelNumber: row.modelNumber,
  imageUrl: row.imageUrl,
  categoryName: row.category.name,
  categoryIcon: row.category.icon as IconName,
  subCategoryName: row.subCategoryName,
  badge: row.badge as ProductBadge,
  retailPrice: row.retailPrice,
  compareAtPrice: row.compareAtPrice,
  // B2B contract pricing is not modelled in the database yet — every visitor
  // resolves to the retail/range price until that feature is built.
  tierPrice: null,
  priceMin: row.priceMin,
  priceMax: row.priceMax,
  stockStatus: row.stockStatus as StockStatus,
  isQuoteOnly: row.isQuoteOnly,
  rating: row.rating,
  reviewCount: row.reviewCount,
});

const toProductDetail = (row: DetailRow): ProductDetail => ({
  slug: row.slug,
  images: row.images as unknown as ProductImage[],
  overview: row.overview as string[],
  highlights: row.highlights as string[],
  sections: row.sections as unknown as ProductSection[],
  specs: row.specs as unknown as SpecRow[],
  documents: row.documents as unknown as ProductDocument[],
  shipping: row.shipping as string[],
  // No review system exists yet — the tab renders empty rather than faking activity.
  reviews: [],
  leadTimeDays: row.leadTimeDays,
  warrantyMonths: row.warrantyMonths,
});

const readProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const rows = await fetchProductListRows();
    return rows.map(toProduct);
  },
  ["products-list"],
  { tags: [CACHE_TAGS.catalog], revalidate: CACHE_DURATION_SECONDS },
);

/**
 * The whole catalogue, as the listings and the cart need it.
 *
 * This has more call sites than anything else in the app — the public
 * layout, the header, the home page, every listing, and the merchandising
 * ranks — so it gets both layers: `unstable_cache` keeps it out of the
 * database between requests, and React's `cache()` collapses the repeat
 * calls within a single render into one.
 */
export const getProducts = cache((): Promise<Product[]> => readProducts());

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  return products.slice(0, limit);
}

/**
 * The corporate/institutional catalogue — every quote-only product,
 * promoted to its own listing instead of sitting mixed into `/products`.
 * Same underlying flag (`isQuoteOnly`) an admin already sets per product;
 * this just gives it a dedicated front door.
 */
export async function getQuoteOnlyProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.isQuoteOnly);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await fetchProductDetailRow(slug);
  return row ? toProduct(row) : null;
}

/**
 * A product together with its detail record.
 *
 * Unlike the demo data this replaced, the database has no separate detail
 * table — every field lives on `Product` itself — so this is one query, not
 * a join between two data sources.
 */
export async function getProductDetail(slug: string): Promise<ProductWithDetail | null> {
  const row = await fetchProductDetailRow(slug);
  if (!row) return null;

  return { product: toProduct(row), detail: toProductDetail(row) };
}

/**
 * Products to show alongside this one.
 *
 * Same category first, then the same brand, then anything else to fill the
 * row — so the strip is genuinely related where it can be, and never renders
 * half empty. The product itself is always excluded.
 */
export async function getRelatedProducts(product: Product, limit = 10): Promise<Product[]> {
  const products = (await getProducts()).filter((entry) => entry.id !== product.id);

  const rank = (candidate: Product): number => {
    if (candidate.categoryName === product.categoryName) return 0;
    if (candidate.brand === product.brand) return 1;
    return 2;
  };

  return [...products].sort((a, b) => rank(a) - rank(b)).slice(0, limit);
}

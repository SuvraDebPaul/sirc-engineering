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

async function fetchProductRows() {
  return prisma.product.findMany({
    include,
    orderBy: { createdAt: "desc" },
  });
}

type ProductRow = Awaited<ReturnType<typeof fetchProductRows>>[number];

const toProduct = (row: ProductRow): Product => ({
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

const toProductDetail = (row: ProductRow): ProductDetail => ({
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

export async function getProducts(): Promise<Product[]> {
  const rows = await fetchProductRows();
  return rows.map(toProduct);
}

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
  const row = await prisma.product.findUnique({ where: { slug }, include });
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
  const row = await prisma.product.findUnique({ where: { slug }, include });
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

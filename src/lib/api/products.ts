import { PRODUCTS, PRODUCT_DETAILS } from "@/data";
import type { Product, ProductWithDetail } from "@/types";

/**
 * Product reads.
 *
 * These run on the server and read the data source directly.
 *
 * They deliberately do NOT fetch `/api/products`. Next's production checklist
 * is explicit: *"do not call Route Handlers from Server Components to avoid an
 * additional server request."* Beyond the wasted hop, the server is not
 * listening during `next build`, so a self-fetch makes static prerendering
 * fail outright — which is exactly what happened before this was fixed.
 *
 * When a real backend arrives, swap the body of each function for
 * `fetchJson("https://api.example.com/products")` from `./client`. That is the
 * case Next's `fetch` is built for — an external origin, with caching and tags.
 * Components never change, because this module is the only seam.
 *
 * The route handlers under `app/api` stay: they serve this same data to
 * Client Components and any external consumer.
 */
export async function getProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  return products.slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

/**
 * A product together with its detail record.
 *
 * Returns null when either half is missing rather than rendering a page with
 * an empty specification table — a product without a detail record is a data
 * fault, and a 404 is a more honest response than a hollow page.
 */
export async function getProductDetail(slug: string): Promise<ProductWithDetail | null> {
  const product = await getProductBySlug(slug);
  if (!product) return null;

  const detail = PRODUCT_DETAILS.find((entry) => entry.slug === slug);
  if (!detail) return null;

  return { product, detail };
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

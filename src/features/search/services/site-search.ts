import { getProducts } from "@/features/catalog/services";
import { getServices } from "@/features/content/services/content";

/**
 * Site-wide search across the catalogue and the laboratory services.
 *
 * The catalogue already has a matcher in `catalog.ts`, but that one is built
 * for the faceted listing: it takes a full `CatalogQuery` and returns every
 * match unranked. A header suggestion drop-down needs the opposite — a plain
 * string in, a short *ranked* list out, spanning two content types that have
 * no shared shape.
 *
 * Ranking is deliberately simple and explainable rather than fuzzy. Someone
 * typing "MIT525" wants that exact model first, and someone typing "fluke"
 * wants the brand grouped together. A prefix match beats a match buried mid
 * string, and a hit on an identifying field (model number, name) beats one on
 * a descriptive field, so the thing you typed the name of comes first.
 */
export type SearchResultKind = "product" | "service";

export interface SearchResult {
  kind: SearchResultKind;
  id: string;
  title: string;
  /** Second line — brand and model for products, the blurb for services. */
  subtitle: string;
  href: string;
  imageUrl: string | null;
  /** Lucide icon name, used when there is no image to show. */
  icon: string;
}

export interface SiteSearchResults {
  products: SearchResult[];
  services: SearchResult[];
  total: number;
}

/**
 * Score one field against the needle.
 *
 * `0` means no match at all, so a caller can distinguish "not a hit" from "a
 * weak hit" — summing raw scores would let three weak matches outrank one
 * exact one.
 */
function scoreField(haystack: string, needle: string, weight: number): number {
  const value = haystack.toLowerCase();
  if (value === needle) return weight * 4;
  if (value.startsWith(needle)) return weight * 2;
  if (value.includes(needle)) return weight;
  return 0;
}

export async function searchSite(rawQuery: string, limitPerKind = 5): Promise<SiteSearchResults> {
  const needle = rawQuery.trim().toLowerCase();
  if (needle === "") return { products: [], services: [], total: 0 };

  const [products, services] = await Promise.all([getProducts(), getServices()]);

  const productHits = products
    .map((product) => {
      // Model number and name identify the thing; category and description
      // merely describe it, so they score lower and can't outrank an exact
      // model-number hit.
      const score =
        scoreField(product.modelNumber, needle, 10) +
        scoreField(product.name, needle, 8) +
        scoreField(product.brand, needle, 6) +
        scoreField(product.categoryName, needle, 3) +
        scoreField(product.description, needle, 1);

      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limitPerKind)
    .map(
      ({ product }): SearchResult => ({
        kind: "product",
        id: product.id,
        title: product.name,
        subtitle: `${product.brand} · ${product.modelNumber}`,
        href: `/product/${product.slug}`,
        imageUrl: product.imageUrl,
        icon: product.categoryIcon,
      }),
    );

  const serviceHits = services
    .map((service) => {
      const score =
        scoreField(service.title, needle, 10) + scoreField(service.description, needle, 2);
      return { service, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limitPerKind)
    .map(
      ({ service }): SearchResult => ({
        kind: "service",
        id: service.id,
        title: service.title,
        subtitle: service.description,
        href: service.href,
        imageUrl: service.imageUrl,
        icon: service.icon,
      }),
    );

  return {
    products: productHits,
    services: serviceHits,
    total: productHits.length + serviceHits.length,
  };
}

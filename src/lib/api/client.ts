import { siteConfig } from "@/config/site";

/**
 * Typed `fetch` wrapper — for **external** APIs.
 *
 * Not used by the demo data layer, which reads `src/data` directly (see
 * `products.ts` for why). This exists so that when a real backend lands, each
 * function in `lib/api/*` becomes a one-line call to `fetchJson` and nothing
 * else in the app changes.
 *
 * It also covers Client Components, which cannot read the server data modules
 * and must go through `app/api/*` over HTTP.
 *
 * Wrapping `fetch` rather than calling it inline buys:
 *  - explicit caching: `revalidate` and `tags` set at the call site, so how
 *    fresh a screen is stays obvious;
 *  - legible failures: a non-OK response throws with status and URL rather
 *    than surfacing later as `undefined is not iterable`.
 */
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  // Vercel preview deployments get a generated hostname.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return siteConfig.url;
}

export interface FetchOptions {
  /** Seconds before the cached response is treated as stale. */
  revalidate?: number | false;
  /** Cache tags for on-demand invalidation via `revalidateTag`. */
  tags?: string[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${getBaseUrl()}${path}`;

  const response = await fetch(url, {
    next: { revalidate: options.revalidate ?? 300, tags: options.tags },
  });

  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status})`, response.status, url);
  }

  return response.json() as Promise<T>;
}

/** Cache tags, centralised so a typo cannot silently break invalidation. */
export const cacheTags = {
  products: "products",
  categories: "categories",
  brands: "brands",
} as const;

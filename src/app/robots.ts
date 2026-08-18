import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Robots policy.
 *
 * `/api/*` is disallowed because those handlers return the same catalogue the
 * pages already render — indexing them would put raw JSON in results competing
 * with the real product pages.
 *
 * Filtered listings are excluded via the query-string rules: every combination
 * of facets is a distinct URL, which is thousands of near-identical pages for
 * a crawler to wade through. The unfiltered listings stay indexable.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/cart",
          "/checkout",
          "/wishlist",
          "/admin",
          "/*?*sort=",
          "/*?*view=",
          "/*?*show=",
          "/*?*price=",
          "/*?*rating=",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

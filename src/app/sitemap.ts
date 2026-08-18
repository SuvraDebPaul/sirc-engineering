import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import {
  getBrands,
  getCategories,
  getProducts,
} from "@/features/catalog/services";
import {
  getIndustries,
  getPosts,
  getServices,
} from "@/features/content/services/content";

/**
 * Sitemap.
 *
 * Generated from the same data that generates the pages, so a product added to
 * the catalogue appears here without anyone remembering to update a list.
 *
 * Priorities are relative, not absolute: the catalogue and services are what
 * the business is trying to be found for, individual products sit below them,
 * and the image credits page is included for completeness rather than reach.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const [products, categories, services, brands, posts, industries] = await Promise.all([
    getProducts(),
    getCategories(),
    getServices(),
    getBrands(),
    getPosts(),
    getIndustries(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/brands`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/industries`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/rfq`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/credits`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...products.map((product) => ({
      url: `${base}/product/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: `${base}/category/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...services.map((service) => ({
      url: `${base}/services/${service.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...brands.map((brand) => ({
      url: `${base}/brands/${brand.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...industries.map((industry) => ({
      url: `${base}/industries/${industry.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}

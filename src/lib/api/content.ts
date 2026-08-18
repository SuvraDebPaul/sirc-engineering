import {
  FEATURES,
  HERO_SLIDES,
  POSTS,
  POST_BODIES,
  PROMOTIONS,
  SERVICES,
  SERVICE_DETAILS,
  TESTIMONIALS,
  INDUSTRIES,
  type Industry,
  type ServiceDetail,
} from "@/data";
import type { PostBlock } from "@/data/post-bodies";
import type { Feature, Post, Product, Promotion, ServiceHighlight, Testimonial } from "@/types";

import { getProducts } from "./products";

/** See the note in `products.ts` on why these read directly rather than fetch. */

export async function getHeroSlides(): Promise<Promotion[]> {
  return HERO_SLIDES;
}

export async function getPromotions(): Promise<Promotion[]> {
  return PROMOTIONS;
}

/** Look one up by id so a section can request exactly the banner it wants. */
export async function getPromotion(id: string): Promise<Promotion | null> {
  return PROMOTIONS.find((promo) => promo.id === id) ?? null;
}

export async function getFeatures(): Promise<Feature[]> {
  return FEATURES;
}

export async function getServices(): Promise<ServiceHighlight[]> {
  return SERVICES;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return TESTIMONIALS;
}

export async function getLatestPosts(limit = 3): Promise<Post[]> {
  return [...POSTS]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export async function getServiceBySlug(slug: string): Promise<ServiceHighlight | null> {
  return SERVICES.find((service) => service.id === slug) ?? null;
}

/** A service with the long-form detail the service page renders. */
export async function getServiceDetail(
  slug: string,
): Promise<{ service: ServiceHighlight; detail: ServiceDetail } | null> {
  const service = await getServiceBySlug(slug);
  if (!service) return null;

  const detail = SERVICE_DETAILS.find((entry) => entry.slug === slug);
  return detail ? { service, detail } : null;
}

/** All posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  return [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * A post with its body.
 *
 * Returns null when the body is missing rather than rendering a headline over
 * an empty page — an article with no text is a data fault, not a page.
 */
export async function getPostDetail(
  slug: string,
): Promise<{ post: Post; blocks: PostBlock[] } | null> {
  const post = POSTS.find((entry) => entry.slug === slug);
  if (!post) return null;

  const body = POST_BODIES.find((entry) => entry.slug === slug);
  return body ? { post, blocks: body.blocks } : null;
}

/** Other posts to read next, newest first, excluding the one being read. */
export async function getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
  const posts = await getPosts();
  return posts.filter((post) => post.slug !== slug).slice(0, limit);
}

export async function getIndustries(): Promise<Industry[]> {
  return INDUSTRIES;
}

export async function getIndustryBySlug(slug: string): Promise<Industry | null> {
  return INDUSTRIES.find((industry) => industry.slug === slug) ?? null;
}

/**
 * Products relevant to an industry.
 *
 * Matched on the industry's listed category names so a sector page always has
 * real stock underneath the copy — an industry page that is only an essay
 * gives a buyer nowhere to go.
 */
export async function getIndustryProducts(industry: Industry, limit = 8): Promise<Product[]> {
  const wanted = new Set(industry.categoryNames.map((name) => name.toLowerCase()));
  const products = await getProducts();
  return products.filter((product) => wanted.has(product.categoryName.toLowerCase())).slice(0, limit);
}

/** Services this sector buys most, in the order the industry lists them. */
export async function getIndustryServices(industry: Industry): Promise<ServiceHighlight[]> {
  return industry.serviceIds
    .map((id) => SERVICES.find((service) => service.id === id))
    .filter((service): service is ServiceHighlight => service !== undefined);
}

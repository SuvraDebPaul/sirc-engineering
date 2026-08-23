import { type Industry, type ServiceDetail } from "@/data";
import { prisma } from "@/lib/db/prisma";
import type { IconName } from "@/lib/icons";
import type { Product } from "@/features/catalog/types";
import type {
  Feature,
  Post,
  PostBlock,
  Promotion,
  ServiceHighlight,
  Testimonial,
} from "@/features/content/types";

import { getProducts } from "@/features/catalog/services/products";

/**
 * Marketing content and the blog.
 *
 * Every section here is a real database row now, admin-authored: the blog
 * from `/admin/blog`, services and industries from their own admin pages, and
 * the home page's hero slides, banner tiles, trust-strip features and
 * customer quotes from `/admin/promotions`, `/admin/features` and
 * `/admin/testimonials`.
 */

// ---------------------------------------------------------------------------
// Promotions — hero slides and banner tiles share one model (one `placement`
// column) since they are the exact same shape, just displayed in different
// home-page zones.
// ---------------------------------------------------------------------------

type PromotionRow = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string;
  href: string;
  imageUrl: string;
  tone: string;
};

const toPromotion = (row: PromotionRow): Promotion => ({
  id: row.id,
  eyebrow: row.eyebrow,
  title: row.title,
  subtitle: row.subtitle ?? undefined,
  ctaLabel: row.ctaLabel,
  href: row.href,
  imageUrl: row.imageUrl,
  tone: row.tone as Promotion["tone"],
});

export async function getHeroSlides(): Promise<Promotion[]> {
  const rows = await prisma.promotion.findMany({
    where: { placement: "hero" },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toPromotion);
}

/**
 * Banner tiles, in display order.
 *
 * The home page fills its fixed promo slots (two paired tiles, one wide
 * tile, two more paired tiles) positionally from this list, so reordering a
 * promotion's `sortOrder` in the admin reorders the page.
 */
export async function getPromotions(): Promise<Promotion[]> {
  const rows = await prisma.promotion.findMany({
    where: { placement: "banner" },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toPromotion);
}

export async function getFeatures(): Promise<Feature[]> {
  const rows = await prisma.feature.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    icon: row.icon,
    title: row.title,
    description: row.description,
  }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const rows = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    headline: row.headline,
    quote: row.quote,
    authorName: row.authorName,
    authorRole: row.authorRole,
    company: row.company,
    imageUrl: row.imageUrl ?? undefined,
  }));
}

// ---------------------------------------------------------------------------
// Services — real rows, admin-authored.
// ---------------------------------------------------------------------------

type ServiceRow = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  turnaroundDays: number;
  onSite: boolean;
  overview: unknown;
  scope: unknown;
  deliverables: unknown;
  process: unknown;
  faqs: unknown;
};

const toServiceHighlight = (row: ServiceRow): ServiceHighlight => ({
  id: row.slug,
  icon: row.icon,
  imageUrl: row.imageUrl,
  title: row.title,
  description: row.description,
  href: `/services/${row.slug}`,
  turnaroundDays: row.turnaroundDays,
  onSite: row.onSite,
});

const toServiceDetail = (row: ServiceRow): ServiceDetail => ({
  slug: row.slug,
  overview: (row.overview as string[] | null) ?? [],
  scope: (row.scope as string[] | null) ?? [],
  deliverables: (row.deliverables as string[] | null) ?? [],
  process: (row.process as { title: string; body: string }[] | null) ?? [],
  faqs: (row.faqs as { question: string; answer: string }[] | null) ?? [],
});

export async function getServices(): Promise<ServiceHighlight[]> {
  const rows = await prisma.service.findMany({ orderBy: { title: "asc" } });
  return rows.map(toServiceHighlight);
}

export async function getServiceBySlug(slug: string): Promise<ServiceHighlight | null> {
  const row = await prisma.service.findUnique({ where: { slug } });
  return row ? toServiceHighlight(row) : null;
}

/** A service with the long-form detail the service page renders. */
export async function getServiceDetail(
  slug: string,
): Promise<{ service: ServiceHighlight; detail: ServiceDetail } | null> {
  const row = await prisma.service.findUnique({ where: { slug } });
  if (!row) return null;

  return { service: toServiceHighlight(row), detail: toServiceDetail(row) };
}

// ---------------------------------------------------------------------------
// Industries — real rows, admin-authored.
// ---------------------------------------------------------------------------

type IndustryRow = {
  slug: string;
  name: string;
  icon: string;
  imageUrl: string;
  summary: string;
  intro: unknown;
  needs: unknown;
  categoryNames: unknown;
  serviceSlugs: unknown;
};

const toIndustry = (row: IndustryRow): Industry => ({
  slug: row.slug,
  name: row.name,
  icon: row.icon as IconName,
  imageUrl: row.imageUrl,
  summary: row.summary,
  intro: (row.intro as string[] | null) ?? [],
  needs: (row.needs as { title: string; body: string }[] | null) ?? [],
  categoryNames: (row.categoryNames as string[] | null) ?? [],
  serviceIds: (row.serviceSlugs as string[] | null) ?? [],
});

export async function getIndustries(): Promise<Industry[]> {
  const rows = await prisma.industry.findMany({ orderBy: { name: "asc" } });
  return rows.map(toIndustry);
}

export async function getIndustryBySlug(slug: string): Promise<Industry | null> {
  const row = await prisma.industry.findUnique({ where: { slug } });
  return row ? toIndustry(row) : null;
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
  if (industry.serviceIds.length === 0) return [];

  const rows = await prisma.service.findMany({ where: { slug: { in: industry.serviceIds } } });
  const bySlug = new Map(rows.map((row) => [row.slug, toServiceHighlight(row)]));
  return industry.serviceIds
    .map((slug) => bySlug.get(slug))
    .filter((service): service is ServiceHighlight => service !== undefined);
}

// ---------------------------------------------------------------------------
// Blog — real rows, admin-authored.
// ---------------------------------------------------------------------------

const WORDS_PER_MINUTE = 200;

/** Reading time from the actual body — never a number an admin has to guess. */
const estimateReadMinutes = (blocks: PostBlock[]): number => {
  const words = blocks.reduce((total, block) => {
    const text = block.type === "ul" ? block.items.join(" ") : block.text;
    return total + text.split(/\s+/).filter(Boolean).length;
  }, 0);
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: Date;
  imageUrl: string;
  tags: unknown;
  blocks: unknown;
};

const toPost = (row: BlogPostRow): Post => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  category: row.category,
  author: row.author,
  publishedAt: row.publishedAt.toISOString().slice(0, 10),
  imageUrl: row.imageUrl,
  tags: (row.tags as string[] | null) ?? [],
  readMinutes: estimateReadMinutes((row.blocks as PostBlock[] | null) ?? []),
});

/** All published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const rows = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(toPost);
}

export async function getLatestPosts(limit = 3): Promise<Post[]> {
  const posts = await getPosts();
  return posts.slice(0, limit);
}

/**
 * A post with its body.
 *
 * Returns null for a draft or a missing slug alike — a visitor with a stale
 * link should see the same 404 either way, not a hint that a draft exists.
 */
export async function getPostDetail(
  slug: string,
): Promise<{ post: Post; blocks: PostBlock[] } | null> {
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  if (!row || row.status !== "PUBLISHED") return null;

  return { post: toPost(row), blocks: (row.blocks as PostBlock[] | null) ?? [] };
}

/** Other posts to read next, newest first, excluding the one being read. */
export async function getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
  const posts = await getPosts();
  return posts.filter((post) => post.slug !== slug).slice(0, limit);
}

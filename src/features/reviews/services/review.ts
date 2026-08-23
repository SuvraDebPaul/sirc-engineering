import { prisma } from "@/lib/db/prisma";

export type ReviewSort = "recent" | "highest" | "lowest";

export const REVIEW_PAGE_SIZE = 10;

const orderByFor = (sort: ReviewSort) => {
  if (sort === "highest") return { rating: "desc" as const };
  if (sort === "lowest") return { rating: "asc" as const };
  return { createdAt: "desc" as const };
};

/**
 * Written reviews for a product.
 *
 * `take` grows in `REVIEW_PAGE_SIZE` steps as "show more" is followed — the
 * same pattern the product listing uses for its own "load more" — rather
 * than a numbered pager, since a product rarely has more than a couple of
 * pages worth.
 */
export async function listReviews(productId: string, sort: ReviewSort, take: number) {
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: orderByFor(sort),
      take,
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  return { reviews, total };
}

export interface ReviewSummary {
  average: number | null;
  total: number;
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
}

/** Real per-star tallies — replaces the estimated-from-the-average distribution. */
export async function getReviewSummary(productId: string): Promise<ReviewSummary> {
  const rows = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: { rating: true },
  });

  const counts: ReviewSummary["counts"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;

  for (const row of rows) {
    const star = row.rating as 1 | 2 | 3 | 4 | 5;
    counts[star] = row._count.rating;
    total += row._count.rating;
    sum += star * row._count.rating;
  }

  return { average: total > 0 ? sum / total : null, total, counts };
}

export async function getUserReviewForProduct(userId: string, productId: string) {
  return prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });
}

/**
 * A "verified purchase" badge means the reviewer has actually ordered this
 * product — any non-cancelled order counts, since requiring delivery
 * confirmation would leave most genuine buyers unable to review at all.
 */
export async function hasVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
  const count = await prisma.orderItem.count({
    where: { productId, order: { userId, status: { not: "CANCELLED" } } },
  });
  return count > 0;
}

async function recomputeProductRating(productId: string): Promise<void> {
  const summary = await getReviewSummary(productId);
  await prisma.product.update({
    where: { id: productId },
    data: { rating: summary.average, reviewCount: summary.total },
  });
}

/** One review per customer per product — resubmitting edits the existing row. */
export async function upsertReview(
  productId: string,
  userId: string,
  data: { rating: number; title: string; body: string },
): Promise<void> {
  const verified = await hasVerifiedPurchase(userId, productId);

  await prisma.review.upsert({
    where: { productId_userId: { productId, userId } },
    create: { productId, userId, verified, ...data },
    update: { verified, ...data },
  });

  await recomputeProductRating(productId);
}

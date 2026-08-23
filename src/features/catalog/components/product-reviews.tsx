import Link from "next/link";
import { Star } from "lucide-react";

import { StarRating } from "@/features/catalog/components/star-rating";
import { ReviewForm } from "@/features/reviews/components/review-form";
import type { ReviewSort, ReviewSummary } from "@/features/reviews/services/review";
import { formatDate } from "@/lib/format";

type ReviewWithUser = {
  id: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: Date;
  user: { name: string };
};

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "highest", label: "Highest rating" },
  { value: "lowest", label: "Lowest rating" },
];

export function ProductReviews({
  productId,
  productSlug,
  summary,
  reviews,
  sort,
  hasMore,
  canReview,
  existingReview,
}: {
  productId: string;
  productSlug: string;
  summary: ReviewSummary;
  reviews: ReviewWithUser[];
  sort: ReviewSort;
  hasMore: boolean;
  canReview: boolean;
  existingReview: { rating: number; title: string; body: string } | null;
}) {
  const sortHref = (value: ReviewSort) =>
    `/product/${productSlug}?reviewSort=${value}#reviews`;

  return (
    <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
      <section aria-label="Rating summary" className="space-y-5">
        <div className="rounded-2xl border bg-muted/30 p-6 text-center">
          <p className="text-5xl font-bold tracking-tight">
            {summary.average !== null ? summary.average.toFixed(1) : "—"}
          </p>

          <div className="mt-2 flex justify-center">
            <StarRating rating={summary.average ?? 0} />
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {summary.total} {summary.total === 1 ? "review" : "reviews"}
          </p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.counts[star as 1 | 2 | 3 | 4 | 5];
            const percent = summary.total > 0 ? (count / summary.total) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="flex w-10 shrink-0 items-center gap-1 tabular-nums">
                  {star}
                  <Star className="size-3 fill-amber-400 text-amber-400" strokeWidth={0} aria-hidden="true" />
                </span>

                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-amber-400"
                    style={{ width: `${percent}%` }}
                  />
                </span>

                <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {canReview ? (
          <ReviewForm productId={productId} productSlug={productSlug} existingReview={existingReview} />
        ) : (
          <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        )}
      </section>

      <section aria-label="Customer reviews" className="space-y-6">
        {summary.total > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort by:</span>
            {SORT_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={sortHref(option.value)}
                className={
                  option.value === sort
                    ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                    : "rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                }
              >
                {option.label}
              </Link>
            ))}
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No written reviews yet. Bought this instrument from us? We would like to hear how it is performing.
          </p>
        ) : (
          <>
            {reviews.map((review) => (
              <article key={review.id} className="border-b pb-6 last:border-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StarRating rating={review.rating} />

                  <h3 className="font-semibold">{review.title}</h3>

                  {review.verified && (
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900">
                      Verified purchase
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.body}</p>

                <p className="mt-3 text-xs text-muted-foreground">
                  {review.user.name} · {formatDate(review.createdAt)}
                </p>
              </article>
            ))}

            {hasMore && (
              <Link
                href={`/product/${productSlug}?reviewSort=${sort}&reviewsShown=${reviews.length + 10}#reviews`}
                className="inline-block text-sm font-medium text-primary hover:underline"
              >
                Show more reviews
              </Link>
            )}
          </>
        )}
      </section>
    </div>
  );
}

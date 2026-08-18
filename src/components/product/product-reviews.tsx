import { Star } from "lucide-react";

import { StarRating } from "@/components/product/star-rating";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product, ProductReview } from "@/types";

/**
 * Reviews panel: a summary, a distribution, then the written reviews.
 *
 * The distribution is **derived from the average and the total**, not stored,
 * so the bars can never disagree with the score printed beside them. It is an
 * approximation of a real histogram — a plausible shape for a given mean —
 * and it is labelled as a distribution rather than as exact counts. When real
 * reviews arrive, this function goes and the true tallies take its place.
 */
const distribution = (rating: number, total: number): number[] => {
  if (total === 0) return [0, 0, 0, 0, 0];

  // Weight each star by its distance from the mean, so a 4.7 average leans
  // heavily on 5s and 4s and leaves almost nothing at 1.
  const weights = [1, 2, 3, 4, 5].map((star) => 1 / (1 + (star - rating) ** 2 * 3));
  const sum = weights.reduce((a, b) => a + b, 0);

  const counts = weights.map((weight) => Math.round((weight / sum) * total));

  // Rounding rarely lands on the total; put the difference on the star closest
  // to the average so the printed count and the bars always agree.
  const drift = total - counts.reduce((a, b) => a + b, 0);
  const peak = Math.min(4, Math.max(0, Math.round(rating) - 1));
  counts[peak] = (counts[peak] ?? 0) + drift;

  return counts;
};

export function ProductReviews({
  product,
  reviews,
}: {
  product: Product;
  reviews: ProductReview[];
}) {
  if (product.rating === null || product.reviewCount === 0) {
    return (
      <div className="rounded-2xl border border-dashed py-16 text-center">
        <p className="font-medium">No reviews yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Bought this instrument from us? We would like to hear how it is performing.
        </p>
      </div>
    );
  }

  const counts = distribution(product.rating, product.reviewCount);

  return (
    <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
      <section aria-label="Rating summary" className="space-y-5">
        <div className="rounded-2xl border bg-muted/30 p-6 text-center">
          <p className="text-5xl font-bold tracking-tight">{product.rating.toFixed(1)}</p>

          <div className="mt-2 flex justify-center">
            <StarRating rating={product.rating} />
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}
          </p>
        </div>

        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = counts[star - 1] ?? 0;
            const percent = product.reviewCount > 0 ? (count / product.reviewCount) * 100 : 0;

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

        <p className="text-xs text-muted-foreground">
          Distribution estimated from the average score.
        </p>
      </section>

      <section aria-label="Customer reviews" className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No written reviews yet.</p>
        ) : (
          reviews.map((review) => (
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

              <p className={cn("mt-3 text-xs text-muted-foreground")}>
                {review.author} · {formatDate(review.date)}
              </p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

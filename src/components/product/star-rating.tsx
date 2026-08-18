import { Star } from "lucide-react";

/**
 * Renders 5 stars with a clipped overlay so 4.7 shows a 70% filled fifth star.
 * Server component — no JS shipped.
 */
export const StarRating = ({ rating }: { rating: number }) => {
  const clamped = Math.min(5, Math.max(0, rating));
  const percent = (clamped / 5) * 100;

  return (
    <span
      className="relative inline-flex shrink-0"
      role="img"
      aria-label={`Rated ${clamped.toFixed(1)} out of 5`}
    >
      {/* Empty track */}
      <span className="flex gap-0.5 text-muted-foreground/30" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className="size-4 fill-current" strokeWidth={0} />
        ))}
      </span>

      {/* Filled overlay, clipped to the score */}
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-400"
        style={{ width: `${percent}%` }}
        aria-hidden
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className="size-4 shrink-0 fill-current"
            strokeWidth={0}
          />
        ))}
      </span>
    </span>
  );
};

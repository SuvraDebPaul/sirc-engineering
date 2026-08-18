import { cn } from "@/lib/utils";

/**
 * Loading placeholder.
 *
 * `animate-pulse` is disabled under `prefers-reduced-motion` — a page full of
 * pulsing blocks is exactly the kind of thing that setting exists to stop.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted motion-reduce:animate-none", className)}
    />
  );
}

/** Placeholder matching the product card's proportions. */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-3">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="mt-4 h-3 w-24" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
      <div className="mt-auto pt-4">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-3 h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

/**
 * The listing shell: sidebar, toolbar and a grid of cards.
 *
 * Shaped to match what replaces it, so the page does not jump when real
 * content arrives. A generic spinner would be less work and a worse
 * experience — it tells the visitor to wait without telling them for what.
 */
export function CatalogSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[17rem_1fr] lg:gap-8">
      <div className="hidden lg:block">
        {["h-72", "h-52", "h-44", "h-60", "h-56", "h-52"].map((height, index) => (
          <Skeleton key={index} className={`mb-5 w-full rounded-xl ${height}`} />
        ))}
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between gap-3 border-b pb-4">
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-[170px] rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

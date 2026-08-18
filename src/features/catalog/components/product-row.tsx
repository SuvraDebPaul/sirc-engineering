import Image from "next/image";
import Link from "next/link";

import { StarRating } from "@/features/catalog/components/star-rating";
import { Icon } from "@/components/shared/icon";
import { formatBDT } from "@/lib/format";
import { discountPercent, resolvePriceDisplay } from "@/features/catalog/services/product";
import type {
  CustomerTier,
  Product,
} from "@/features/catalog/types";

/**
 * Compact horizontal product card.
 *
 * A denser alternative to `ProductCard` for bands showing many items in little
 * vertical space. Same pricing rules — it calls the same `resolvePriceDisplay`,
 * so the two card shapes can never disagree about what something costs.
 *
 * Stays a server component: the action is a link, not a cart mutation, so
 * nothing here needs to hydrate.
 */
export function ProductRow({ product, tier }: { product: Product; tier: CustomerTier }) {
  const price = resolvePriceDisplay(product, tier);
  const discount = discountPercent(product);
  const quoteOnly = price.kind === "quote";

  return (
    <article className="group flex gap-4 rounded-xl border bg-card p-3 transition-shadow hover:shadow-md">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted/40">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            sizes="96px"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/25">
            <Icon name={product.categoryIcon} className="size-9" strokeWidth={1} aria-hidden="true" />
          </div>
        )}

        {discount !== null && (
          <span className="absolute left-1 top-1 rounded bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-white">
            −{discount}%
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>

        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          <Link href={`/product/${product.slug}`} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>

        {product.rating !== null && <StarRating rating={product.rating} />}

        <div className="mt-1 text-sm">
          {price.kind === "price" && (
            <span className="flex items-baseline gap-2">
              <span className="font-semibold">{formatBDT(price.amount)}</span>
              {price.compareAt !== null && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatBDT(price.compareAt)}
                </span>
              )}
            </span>
          )}

          {price.kind === "range" && (
            <span className="font-semibold">
              {formatBDT(price.min)} – {formatBDT(price.max)}
            </span>
          )}

          {quoteOnly && <span className="text-muted-foreground">Price on request</span>}
        </div>

        {/* The reference puts an underlined text action here rather than a
            button — it keeps the row compact and reads as secondary to the
            title link without being invisible. */}
        <Link
          href={quoteOnly ? `/rfq?sku=${encodeURIComponent(product.modelNumber)}` : `/product/${product.slug}`}
          className="mt-1 w-fit text-xs font-semibold uppercase tracking-wide text-primary underline underline-offset-4 hover:no-underline"
        >
          {quoteOnly ? "Ask for price" : "View details"}
        </Link>
      </div>
    </article>
  );
}

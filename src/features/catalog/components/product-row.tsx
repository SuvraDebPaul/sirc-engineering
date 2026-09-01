import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Icon } from "@/components/shared/icon";
import { formatBDT } from "@/lib/format";
import { discountPercent, resolvePriceDisplay, STOCK_DOT, STOCK_LABEL } from "@/features/catalog/services/product";
import { cn } from "@/lib/utils";
import type {
  CustomerTier,
  Product,
} from "@/features/catalog/types";

/**
 * Compact horizontal product card.
 *
 * A denser alternative to `ProductCard` for bands showing many items in little
 * vertical space. Same pricing rules — it calls the same `resolvePriceDisplay`,
 * so the two card shapes can never disagree about what something costs. Same
 * hover language too: the lift and primary-tinted shadow match the grid card,
 * so switching the view toggle doesn't change what "interactive" looks like.
 *
 * Stays a server component: the action is a link, not a cart mutation, so
 * nothing here needs to hydrate.
 */
export function ProductRow({ product, tier }: { product: Product; tier: CustomerTier }) {
  const price = resolvePriceDisplay(product, tier);
  const discount = discountPercent(product);
  const quoteOnly = price.kind === "quote";

  return (
    <article className="group relative flex cursor-pointer gap-4 rounded-2xl border border-border/60 bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 sm:gap-5 sm:p-4">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted/40 sm:size-28">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            sizes="112px"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/25">
            <Icon name={product.categoryIcon} className="size-9" strokeWidth={1} aria-hidden="true" />
          </div>
        )}

        {discount !== null && (
          <span className="absolute top-1.5 left-1.5 rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            −{discount}%
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {product.brand}
        </p>

        <h3 className="line-clamp-2 text-sm leading-snug font-semibold sm:text-base">
          <Link
            href={`/product/${product.slug}`}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:underline focus-visible:outline-none"
          >
            <span className="transition-colors duration-200 group-hover:text-primary">
              {product.name}
            </span>
          </Link>
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="text-sm">
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

          <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden="true">
            ·
          </span>

          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
            <span
              className={cn("size-1.5 rounded-full", STOCK_DOT[product.stockStatus])}
              aria-hidden="true"
            />
            {STOCK_LABEL[product.stockStatus]}
          </span>
        </div>

        {/* Relative z-10: the stretched link on the title covers this row too,
            so this action needs to sit above it to stay clickable on its own. */}
        <Link
          href={quoteOnly ? `/rfq?sku=${encodeURIComponent(product.modelNumber)}` : `/product/${product.slug}`}
          className="relative z-10 mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold tracking-wide text-primary uppercase underline-offset-4 hover:underline"
        >
          {quoteOnly ? "Ask for price" : "View details"}
          <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:rotate-45" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

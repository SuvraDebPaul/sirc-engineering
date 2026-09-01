"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  CardActions,
  AddToCartButton,
} from "@/features/catalog/components/product-card-actions";
import { QuickViewDialog } from "@/features/catalog/components/quick-view-dialog";
import { StarRating } from "@/features/catalog/components/star-rating";
import { Icon } from "@/components/shared/icon";
import { formatBDT } from "@/lib/format";
import {
  BADGE_CLASS,
  BADGE_LABEL,
  discountPercent,
  resolvePriceDisplay,
  STOCK_DOT,
  STOCK_LABEL,
} from "@/features/catalog/services/product";
import { cn } from "@/lib/utils";
import type { CustomerTier, Product } from "@/features/catalog/types";

type ProductCardProps = {
  product: Product;
  tier: CustomerTier;
  priority?: boolean;
  /** Off on the catalogue listing (products/category/brand) — on everywhere else. */
  showRating?: boolean;
};

/**
 * Product card.
 *
 * Edge-to-edge photo with the content block below it, rather than a photo
 * inset inside padding — the image is the thing being scanned, so it gets the
 * full width of the card.
 *
 * The lift on hover (`-translate-y-1` + shadow) is on the card, never on its
 * contents: scaling text or buttons on hover shifts the layout under the
 * cursor. The photo's own zoom is safe because it's clipped by the image
 * frame's `overflow-hidden` and can't push anything around it.
 *
 * Stock is shown as a dot *and* a label. Colour alone would fail for anyone
 * who can't distinguish amber from emerald, so the word carries the meaning
 * and the dot only reinforces it.
 */
export const ProductCard = ({
  product,
  tier,
  priority = false,
  showRating = true,
}: ProductCardProps) => {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const price = resolvePriceDisplay(product, tier);
  const discount = discountPercent(product);
  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";

  return (
    <article className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 motion-reduce:transform-none">
      <div className="relative aspect-square overflow-hidden bg-linear-to-b from-muted/30 to-muted/60">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/25">
            <Icon
              name={product.categoryIcon}
              className="size-16"
              strokeWidth={1}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Saving, top-left. Computed from compare-at rather than stored, so it
            can never contradict the prices shown below it. */}
        {discount !== null && (
          <span className="absolute top-3 left-3 z-10 rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-white shadow-sm">
            −{discount}%
          </span>
        )}

        {isOutOfStock && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 grid place-items-center bg-background/60 backdrop-blur-[1px]"
          >
            <span className="rounded-full bg-background px-4 py-1.5 text-xs font-semibold shadow-sm">
              Out of stock
            </span>
          </div>
        )}

        <CardActions
          product={product}
          onQuickView={() => setQuickViewOpen(true)}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {product.brand}
          </span>

          {product.badge && (
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                BADGE_CLASS[product.badge],
              )}
            >
              {BADGE_LABEL[product.badge]}
            </span>
          )}
        </div>

        <h3 className="text-base leading-snug font-semibold my-1">
          {/* Stretched link: the whole card is clickable, one entry in the a11y tree */}
          <Link
            href={`/product/${product.slug}`}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:underline focus-visible:outline-none"
          >
            <span className="text-sm line-clamp-2 transition-colors duration-200 group-hover:text-primary">
              {product.name}
            </span>
          </Link>
        </h3>

        <p className="text-xs text-muted-foreground">{product.categoryName}</p>

        {/* mt-auto pins price + button to the bottom so cards in a row align */}
        <div className="mt-auto pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                STOCK_DOT[product.stockStatus],
              )}
              aria-hidden="true"
            />
            {STOCK_LABEL[product.stockStatus]}
          </div>

          <div className="my-1 flex min-h-8 flex-wrap items-baseline gap-x-2">
            {price.kind === "price" && (
              <>
                <span className="text-md font-semibold tracking-tight">
                  {formatBDT(price.amount)}
                </span>
                {price.compareAt !== null && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatBDT(price.compareAt)}
                  </span>
                )}
                {price.note && (
                  <span className="w-full text-xs text-emerald-600 dark:text-emerald-400">
                    {price.note}
                  </span>
                )}
              </>
            )}

            {price.kind === "range" && (
              <span className="text-md font-semibold tracking-tight">
                {formatBDT(price.min)} – {formatBDT(price.max)}
              </span>
            )}

            {price.kind === "quote" && (
              <span className="text-md text-base font-medium text-muted-foreground">
                Price on request
              </span>
            )}
          </div>

          <AddToCartButton
            productId={product.id}
            productName={product.name}
            model={product.modelNumber}
            mode={price.kind === "quote" ? "quote" : "cart"}
            disabled={isOutOfStock}
          />
        </div>
      </div>

      <QuickViewDialog
        product={product}
        tier={tier}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </article>
  );
};

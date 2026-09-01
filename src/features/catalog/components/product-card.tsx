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
  tier?: CustomerTier;
  priority?: boolean;
  /** Off on the catalogue listing (products/category/brand) — on everywhere else. */
  showRating?: boolean;
};

/**
 * Product Card — High-precision industrial instrument presentation.
 */
export const ProductCard = ({
  product,
  tier = "GUEST",
  priority = false,
  showRating = true,
}: ProductCardProps) => {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const price = resolvePriceDisplay(product, tier);
  const discount = discountPercent(product);
  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";

  return (
    <article className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:ring-1 hover:ring-primary/20 motion-reduce:transform-none">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-linear-to-b from-muted/30 to-muted/60 border-b border-border/40">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
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

        {/* Discount Badge */}
        {discount !== null && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-destructive px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md shadow-destructive/20">
            −{discount}%
          </span>
        )}

        {/* Out of Stock Scrim */}
        {isOutOfStock && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 grid place-items-center bg-background/70 backdrop-blur-[2px]"
          >
            <span className="rounded-full bg-background border border-border px-3.5 py-1 text-xs font-semibold shadow-sm text-muted-foreground">
              Out of stock
            </span>
          </div>
        )}

        {/* Floating Actions: Wishlist & Quick View */}
        <CardActions
          product={product}
          onQuickView={() => setQuickViewOpen(true)}
        />
      </div>

      {/* Details Container */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand & Model Chip */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className="min-w-0 truncate text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
            {product.brand}
          </span>

          <div className="flex items-center gap-1.5">
            {product.modelNumber && (
              <span className="shrink-0 rounded bg-muted/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-foreground/80 border border-border/50">
                {product.modelNumber}
              </span>
            )}

            {product.badge && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                  BADGE_CLASS[product.badge],
                )}
              >
                {BADGE_LABEL[product.badge]}
              </span>
            )}
          </div>
        </div>

        {/* Product Title */}
        <h3 className="text-sm font-semibold leading-snug text-balance">
          <Link
            href={`/product/${product.slug}`}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:underline focus-visible:outline-none"
          >
            <span className="line-clamp-2 text-foreground transition-colors duration-200 group-hover:text-primary">
              {product.name}
            </span>
          </Link>
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">{product.categoryName}</p>

        {/* Rating */}
        {showRating && product.rating !== null && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <StarRating rating={product.rating} />
            <span className="text-[11px] font-medium text-foreground/80">{product.rating.toFixed(1)}</span>
            {product.reviewCount > 0 && <span className="text-[11px]">({product.reviewCount})</span>}
          </div>
        )}

        {/* Price & Action Button Container */}
        <div className="mt-auto pt-3 border-t border-border/50">
          {/* Stock Availability */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                STOCK_DOT[product.stockStatus],
                product.stockStatus === "IN_STOCK" && "ring-2 ring-emerald-500/20",
              )}
              aria-hidden="true"
            />
            <span className="text-[11px] font-medium">{STOCK_LABEL[product.stockStatus]}</span>
          </div>

          {/* Pricing Display */}
          <div className="mb-2.5 flex min-h-7 flex-wrap items-baseline gap-x-2">
            {price.kind === "price" && (
              <>
                <span className="text-base font-bold tracking-tight text-foreground">
                  {formatBDT(price.amount)}
                </span>
                {price.compareAt !== null && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatBDT(price.compareAt)}
                  </span>
                )}
                {price.note && (
                  <span className="w-full text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {price.note}
                  </span>
                )}
              </>
            )}

            {price.kind === "range" && (
              <span className="text-sm font-bold tracking-tight text-foreground">
                {formatBDT(price.min)} – {formatBDT(price.max)}
              </span>
            )}

            {price.kind === "quote" && (
              <span className="text-sm font-semibold text-primary">
                Price on request
              </span>
            )}
          </div>

          {/* Add to Cart / RFQ Button */}
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

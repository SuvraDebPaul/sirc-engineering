"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";

import { CardActions, AddToCartButton } from "@/features/catalog/components/product-card-actions";
import { QuickViewDialog } from "@/features/catalog/components/quick-view-dialog";
import { StarRating } from "@/features/catalog/components/star-rating";
import { Icon } from "@/components/shared/icon";
import { formatBDT } from "@/lib/format";
import { BADGE_CLASS, BADGE_LABEL, discountPercent, resolvePriceDisplay } from "@/features/catalog/services/product";
import { cn } from "@/lib/utils";
import type {
  CustomerTier,
  Product,
} from "@/features/catalog/types";

type ProductCardProps = {
  product: Product;
  tier: CustomerTier;
  priority?: boolean;
};

export const ProductCard = ({ product, tier, priority = false }: ProductCardProps) => {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const price = resolvePriceDisplay(product, tier);
  const discount = discountPercent(product);
  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border bg-card p-3 transition-shadow duration-200 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/40">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/25">
            <Icon name={product.categoryIcon} className="size-16" strokeWidth={1} aria-hidden="true" />
          </div>
        )}

        {/* Saving, top-left. Computed from compare-at rather than stored, so it
            can never contradict the prices shown below it. */}
        {discount !== null && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-white shadow-sm">
            −{discount}%
          </span>
        )}

        <CardActions product={product} onQuickView={() => setQuickViewOpen(true)} />
      </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <Tag className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          <span className="truncate">{product.categoryName}</span>
          {product.subCategoryName && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span className="truncate">{product.subCategoryName}</span>
            </>
          )}
        </div>

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

      <h3 className="mt-2 text-base font-semibold leading-snug">
        {/* Stretched link: the whole card is clickable, one entry in the a11y tree */}
        <Link
          href={`/product/${product.slug}`}
          className="after:absolute after:inset-0 after:rounded-2xl focus-visible:underline focus-visible:outline-none"
        >
          <span className="line-clamp-1">{product.name}</span>
        </Link>
      </h3>

      <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
        {product.description}
      </p>

      {product.rating !== null && (
        <div className="mt-3 flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
          <span className="min-w-0 truncate text-sm text-muted-foreground">
            {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>
      )}

      {/* mt-auto pins price + button to the bottom so cards in a row align */}
      <div className="mt-auto pt-3">
        <div className="flex min-h-8 flex-wrap items-baseline gap-x-2">
          {price.kind === "price" && (
            <>
              <span className="text-xl font-semibold tracking-tight">{formatBDT(price.amount)}</span>
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
            <span className="text-xl font-semibold tracking-tight">
              {formatBDT(price.min)} – {formatBDT(price.max)}
            </span>
          )}

          {price.kind === "quote" && (
            <span className="text-base font-medium text-muted-foreground">Price on request</span>
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

      <QuickViewDialog
        product={product}
        tier={tier}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </article>
  );
};

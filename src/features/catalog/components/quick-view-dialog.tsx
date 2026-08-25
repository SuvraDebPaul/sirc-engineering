"use client";

import Image from "next/image";
import Link from "next/link";
import { Tag, X } from "lucide-react";

import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/features/catalog/components/star-rating";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type {
  CustomerTier,
  Product,
} from "@/features/catalog/types";

/**
 * Quick view.
 *
 * Enough to decide whether to open the full page — image, price, availability,
 * lead time — without losing scroll position in the listing. It deliberately
 * does not try to be the product page: the full description and specifications
 * stay one click away rather than being crammed into a modal.
 *
 * Full-bleed photo on one side, details on the other — the same split as the
 * promo banners and product page, so the modal doesn't feel like a separate
 * design system from the page it interrupts. `DialogContent`'s own padding,
 * gap and width are all overridden (matching variants, so they actually win
 * over the defaults) rather than fought with utility overrides on top.
 */
export function QuickViewDialog({
  product,
  tier = "GUEST",
  open,
  onOpenChange,
}: {
  product: Product | null;
  tier?: CustomerTier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!product) return null;

  const price = resolvePriceDisplay(product, tier);
  const quoteOnly = price.kind === "quote";
  const discount = discountPercent(product);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid grid-cols-1 gap-0 overflow-hidden p-0 sm:max-w-3xl sm:grid-cols-2"
      >
        {/* Photo panel */}
        <div className="relative aspect-square bg-muted/40 sm:aspect-auto">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="(min-width: 640px) 420px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground/25">
              <Icon name={product.categoryIcon} className="size-20" strokeWidth={1} aria-hidden="true" />
            </div>
          )}

          {discount !== null && (
            <span className="absolute top-4 left-4 rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-white shadow-sm">
              −{discount}%
            </span>
          )}

          <DialogClose className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* Details panel */}
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-start justify-between gap-2">
            <DialogDescription className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <Tag className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span className="truncate">
                {product.brand} · {product.modelNumber}
              </span>
            </DialogDescription>

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

          <DialogTitle className="mt-2 text-xl leading-snug font-semibold text-balance">
            {product.name}
          </DialogTitle>

          {product.rating !== null && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>
          )}

          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-5 flex min-h-9 flex-wrap items-baseline gap-x-2">
            {price.kind === "price" && (
              <>
                <span className="text-2xl font-semibold tracking-tight">{formatBDT(price.amount)}</span>
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
              <span className="text-2xl font-semibold tracking-tight">
                {formatBDT(price.min)} – {formatBDT(price.max)}
              </span>
            )}

            {quoteOnly && (
              <span className="text-lg font-medium text-muted-foreground">Price on request</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium">
              <span className={cn("size-1.5 rounded-full", STOCK_DOT[product.stockStatus])} aria-hidden="true" />
              {STOCK_LABEL[product.stockStatus]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Icon name={product.categoryIcon} className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              {product.categoryName}
            </span>
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-6">
            <Button asChild className="h-11 rounded-xl shadow-sm">
              <Link href={`/rfq?sku=${encodeURIComponent(product.modelNumber)}`}>
                {quoteOnly ? "Ask for price" : "Request a quote"}
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-xl">
              <Link href={`/product/${product.slug}`}>View full details</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

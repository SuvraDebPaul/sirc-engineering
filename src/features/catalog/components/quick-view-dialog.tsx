"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileText, Tag, X } from "lucide-react";

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
 * Quick View Dialog — Rapid instrument preview modal.
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
        className="grid grid-cols-1 gap-0 overflow-hidden p-0 rounded-3xl border border-border/80 bg-background shadow-2xl sm:max-w-3xl sm:grid-cols-2"
      >
        {/* Photo panel */}
        <div className="relative aspect-square bg-muted/30 sm:aspect-auto border-b sm:border-b-0 sm:border-r border-border/50">
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
            <span className="absolute top-4 left-4 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-white shadow-md shadow-destructive/20">
              −{discount}%
            </span>
          )}

          <DialogClose className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-border/60 bg-background/90 text-muted-foreground shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* Details panel */}
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between gap-2">
            <DialogDescription className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Tag className="size-3.5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden="true" />
              <span className="truncate">
                {product.brand} {product.modelNumber ? `· ${product.modelNumber}` : ""}
              </span>
            </DialogDescription>

            {product.badge && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                  BADGE_CLASS[product.badge],
                )}
              >
                {BADGE_LABEL[product.badge]}
              </span>
            )}
          </div>

          <DialogTitle className="mt-2.5 text-xl leading-snug font-bold text-foreground text-balance">
            {product.name}
          </DialogTitle>

          {product.rating !== null && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          <p className="mt-3 line-clamp-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-5 flex min-h-9 flex-wrap items-baseline gap-x-2.5 border-t border-border/50 pt-4">
            {price.kind === "price" && (
              <>
                <span className="text-2xl font-bold tracking-tight text-foreground">{formatBDT(price.amount)}</span>
                {price.compareAt !== null && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatBDT(price.compareAt)}
                  </span>
                )}
                {price.note && (
                  <span className="w-full text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {price.note}
                  </span>
                )}
              </>
            )}

            {price.kind === "range" && (
              <span className="text-xl font-bold tracking-tight text-foreground">
                {formatBDT(price.min)} – {formatBDT(price.max)}
              </span>
            )}

            {quoteOnly && (
              <span className="text-lg font-semibold text-primary">Price on request</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1 text-xs font-medium border border-border/50">
              <span className={cn("size-2 rounded-full", STOCK_DOT[product.stockStatus])} aria-hidden="true" />
              {STOCK_LABEL[product.stockStatus]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-3 py-1 text-xs font-medium text-muted-foreground border border-border/50">
              <Icon name={product.categoryIcon} className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              {product.categoryName}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
              Genuine Warranty
            </span>
          </div>

          <div className="mt-auto flex flex-col gap-2.5 pt-6">
            <Button asChild size="lg" className="rounded-full shadow-md shadow-primary/20">
              <Link href={`/rfq?sku=${encodeURIComponent(product.modelNumber)}`} className="inline-flex items-center justify-center gap-2">
                <FileText className="size-4" aria-hidden="true" />
                <span>{quoteOnly ? "Request Immediate Quotation" : "Request a Quote"}</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-border/80 hover:border-primary">
              <Link href={`/product/${product.slug}`} className="inline-flex items-center justify-center gap-1.5">
                <span>View Full Specifications & Downloads</span>
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

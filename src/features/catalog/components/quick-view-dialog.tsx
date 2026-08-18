"use client";

import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBDT } from "@/lib/format";
import { STOCK_LABEL, resolvePriceDisplay } from "@/features/catalog/services/product";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-left">{product.name}</DialogTitle>
          <DialogDescription className="text-left">
            {product.brand} · {product.modelNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/40">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt=""
                fill
                sizes="(min-width: 640px) 300px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground/25">
                <Icon name={product.categoryIcon} className="size-16" strokeWidth={1} aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">{product.description}</p>

            <div className="mt-4">
              {price.kind === "price" && (
                <p className="flex items-baseline gap-2">
                  <span className="text-2xl font-semibold">{formatBDT(price.amount)}</span>
                  {price.compareAt !== null && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatBDT(price.compareAt)}
                    </span>
                  )}
                </p>
              )}

              {price.kind === "range" && (
                <p className="text-2xl font-semibold">
                  {formatBDT(price.min)} – {formatBDT(price.max)}
                </p>
              )}

              {quoteOnly && (
                <p className="text-lg font-medium text-muted-foreground">Price on request</p>
              )}
            </div>

            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Availability</dt>
                <dd className="font-medium">{STOCK_LABEL[product.stockStatus]}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium">{product.categoryName}</dd>
              </div>
              {product.rating !== null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Rating</dt>
                  <dd className="font-medium">
                    {product.rating.toFixed(1)} / 5 ({product.reviewCount})
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-auto flex flex-col gap-2 pt-6">
              <Button asChild>
                <Link href={`/rfq?sku=${encodeURIComponent(product.modelNumber)}`}>
                  {quoteOnly ? "Ask for price" : "Request a quote"}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/product/${product.slug}`}>View full details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

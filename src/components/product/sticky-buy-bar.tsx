"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Sticky purchase bar, revealed once the real buy box scrolls away.
 *
 * Watches a sentinel element with an `IntersectionObserver` rather than
 * listening to scroll: the callback fires twice for the whole page instead of
 * on every frame, and it does no layout reads, so there is nothing here to
 * make scrolling jank.
 *
 * It is `aria-hidden` while off screen and the buttons are removed from the
 * tab order, so a keyboard user never lands on a control they cannot see. On
 * screen it is a duplicate of the main buy box, so it is marked as such rather
 * than announced as a second set of unrelated actions.
 */
export function StickyBuyBar({
  sentinelId,
  productName,
  brand,
  model,
  imageUrl,
  priceLabel,
  quoteOnly,
  outOfStock,
}: {
  sentinelId: string;
  productName: string;
  brand: string;
  model: string;
  imageUrl: string | null;
  priceLabel: string;
  quoteOnly: boolean;
  outOfStock: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry?.isIntersecting),
      // Fire once the buy box has cleared the header rather than the moment
      // its last pixel leaves the viewport.
      { rootMargin: "-120px 0px 0px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur transition-transform duration-300 motion-reduce:transition-none",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex w-11/12 items-center gap-4 py-3">
        <div className="hidden items-center gap-3 sm:flex">
          {imageUrl && (
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted/40">
              <Image src={imageUrl} alt="" fill sizes="48px" className="object-cover" />
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{productName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {brand} · {model}
            </p>
          </div>
        </div>

        <p className="min-w-0 flex-1 truncate text-base font-semibold sm:flex-none">{priceLabel}</p>

        <div className="ml-auto flex items-center gap-2">
          {quoteOnly ? (
            <Button asChild size="lg" tabIndex={visible ? undefined : -1}>
              <Link href={`/rfq?sku=${encodeURIComponent(model)}`}>
                <FileText className="size-4" aria-hidden="true" />
                Ask for price
              </Link>
            </Button>
          ) : (
            <Button
              size="lg"
              disabled={outOfStock}
              tabIndex={visible ? undefined : -1}
              // The sentinel is the real buy box; sending the visitor back to
              // it keeps one cart implementation rather than two.
              onClick={() => document.getElementById(sentinelId)?.scrollIntoView({ block: "center" })}
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              {outOfStock ? "Out of stock" : "Add to cart"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

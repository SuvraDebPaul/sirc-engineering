"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, FileText, Heart, Link2, Minus, Plus, Share2, ShoppingBag } from "lucide-react";

import { useCart } from "@/features/cart/components/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Quantity, buy actions and the secondary action row.
 *
 * One client component rather than four, because these controls share state:
 * the quantity chosen has to reach both buy buttons, and splitting them would
 * mean lifting it into a context for no benefit.
 *
 * Quote-only products get a single route to the RFQ form instead of a cart.
 * There is no quantity stepper on that path — asking someone to pick a
 * quantity for an item with no price is a question they cannot answer.
 *
 * Cart and wishlist writes go to the real store — see `lib/cart.ts`.
 */
const MAX_QUANTITY = 99;

export function ProductBuyBox({
  productId,
  productName,
  model,
  quoteOnly,
  outOfStock,
}: {
  productId: string;
  productName: string;
  model: string;
  quoteOnly: boolean;
  outOfStock: boolean;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Writes to local storage, so it is synchronous. A spinner for something
  // that cannot fail or take time would be theatre.
  const addToCart = () => {
    addItem(productId, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    addItem(productId, quantity);
    router.push("/checkout");
  };

  return (
    <div className="space-y-4">
      {quoteOnly ? (
        <Button asChild size="lg" className="h-12 w-full text-base">
          <Link href={`/rfq?sku=${encodeURIComponent(model)}`}>
            <FileText className="size-4" aria-hidden="true" />
            Ask for price
          </Link>
        </Button>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border" role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || outOfStock}
                aria-label="Decrease quantity"
                className="grid size-11 place-items-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>

              <input
                type="number"
                min={1}
                max={MAX_QUANTITY}
                value={quantity}
                disabled={outOfStock}
                aria-label="Quantity"
                onChange={(event) => {
                  const next = Number(event.target.value);
                  // Guard the typed path as well as the buttons — the spinner
                  // and a paste both land here, and neither is clamped for us.
                  if (Number.isFinite(next)) {
                    setQuantity(Math.min(MAX_QUANTITY, Math.max(1, Math.floor(next))));
                  }
                }}
                className="h-11 w-14 border-x bg-transparent text-center text-sm font-medium tabular-nums outline-none focus-visible:bg-muted [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />

              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                disabled={quantity >= MAX_QUANTITY || outOfStock}
                aria-label="Increase quantity"
                className="grid size-11 place-items-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>

            <Button
              type="button"
              size="lg"
              onClick={addToCart}
              disabled={outOfStock}
              className="h-11 min-w-44 flex-1 text-base"
              data-product-id={productId}
            >
              {added ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <ShoppingBag className="size-4" aria-hidden="true" />
              )}
              {outOfStock ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
            </Button>
          </div>

          <Button
            asChild={!outOfStock}
            variant="secondary"
            size="lg"
            disabled={outOfStock}
            className="h-12 w-full text-base"
          >
            {outOfStock ? (
              <span>Out of stock</span>
            ) : (
              // Adds the chosen quantity, then goes straight to checkout —
              // which is what "buy now" means everywhere else.
              <button type="button" onClick={buyNow}>Buy now</button>
            )}
          </Button>
        </>
      )}

      <ActionRow productId={productId} productName={productName} model={model} />
    </div>
  );
}

function ActionRow({
  productId,
  productName,
  model,
}: {
  productId: string;
  productName: string;
  model: string;
}) {
  const { toggleWishlist, isWishlisted } = useCart();
  const saved = isWishlisted(productId);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y py-3 text-sm">
      <button
        type="button"
        onClick={() => toggleWishlist(productId)}
        aria-pressed={saved}
        className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Heart
          className={cn("size-4", saved && "fill-red-500 text-red-500")}
          aria-hidden="true"
        />
        {saved ? "Saved" : "Wishlist"}
      </button>

      <Link
        // /contact does not exist yet; the quotation form is the working
        // route to a human, and it carries the model across.
        href={`/rfq?type=other&sku=${encodeURIComponent(model)}`}
        className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <FileText className="size-4" aria-hidden="true" />
        Ask us
      </Link>

      <ShareButton productName={productName} />
    </div>
  );
}

/**
 * Share via the platform sheet where it exists, copy the link where it does
 * not. No social network buttons: they would each need a script, and the
 * native sheet already offers every app the visitor actually has.
 */
function ShareButton({ productName }: { productName: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: productName, url });
        return;
      } catch {
        // Dismissed, or the sheet refused. Fall through to copying.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure origin, or permission denied). Nothing
      // useful to offer here, and a thrown error would break the page.
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
    >
      {copied ? <Link2 className="size-4" aria-hidden="true" /> : <Share2 className="size-4" aria-hidden="true" />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

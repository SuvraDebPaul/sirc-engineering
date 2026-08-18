"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Eye, FileText, Heart, ShoppingBag } from "lucide-react";

import { useCart } from "@/features/cart/components/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/features/catalog/types";

/**
 * Card hover actions.
 *
 * Hidden until the card is hovered, as designed. Two guards keep that from
 * locking anyone out:
 *
 *  - `[.group:focus-within_&]` reveals them for keyboard users, who never hover.
 *  - `@media (hover: none)` keeps them permanently visible on touch, where a
 *    hover state can never occur and the controls would otherwise be dead.
 *
 * The reveal uses arbitrary variants rather than `group-hover:`. Tailwind
 * compiles `group-hover` with `:where(.group)`, which has zero specificity, so
 * it ties with the base `opacity-0` — and `opacity-0` is emitted later in the
 * sheet, so it won and the buttons never appeared. Writing `.group:hover`
 * directly gives the reveal a real class in the selector, so it wins outright.
 *
 * `z-10` keeps them above the card's stretched link; without it the link
 * swallows every click.
 *
 * Cart and wishlist writes go to the real store — see `lib/cart.ts`.
 */
export function CardActions({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView: () => void;
}) {
  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 transition-opacity duration-200 [.group:hover_&]:opacity-100 [.group:focus-within_&]:opacity-100 [@media(hover:none)]:opacity-100!">
      <WishlistButton productId={product.id} productName={product.name} />

      <ActionButton label={`Quick view: ${product.name}`} onClick={onQuickView}>
        <Eye className="size-4" aria-hidden="true" />
      </ActionButton>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transform-none"
    >
      {children}
    </button>
  );
}

/**
 * Wishlist toggle.
 *
 * The saved state comes through `useSyncExternalStore`, so it renders unsaved
 * during hydration and corrects immediately after — no mismatch, no flag.
 */
export const WishlistButton = ({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) => {
  const { toggleWishlist, isWishlisted } = useCart();
  const saved = isWishlisted(productId);

  return (
    <button
      type="button"
      onClick={() => toggleWishlist(productId)}
      aria-pressed={saved}
      aria-label={
        saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`
      }
      title={saved ? "Saved to wishlist" : "Save to wishlist"}
      data-product-id={productId}
      className="grid size-9 place-items-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transform-none"
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          saved ? "fill-red-500 text-red-500" : "text-muted-foreground",
        )}
        strokeWidth={2}
        aria-hidden="true"
      />
    </button>
  );
};

/**
 * Primary card action.
 *
 * Three shapes, decided by the resolved price rather than by the caller:
 * a real button for buyable stock, and a link to the RFQ form — carrying the
 * SKU — for anything quoted. The quote path is a `Link`, not a button, because
 * it navigates; making it a button would break middle-click and open-in-new-tab.
 *
 * The add is synchronous — it writes to local storage — so there is no pending
 * spinner. A loading state for an operation that cannot fail or take time
 * would be theatre.
 */
export const AddToCartButton = ({
  productId,
  productName,
  model,
  mode,
  disabled = false,
}: {
  productId: string;
  productName: string;
  model: string;
  mode: "cart" | "quote";
  disabled?: boolean;
}) => {
  const { addItem } = useCart();
  const [done, setDone] = useState(false);

  if (mode === "quote") {
    return (
      <Button asChild variant="outline" className="relative z-10 mt-3 h-11 w-full rounded-xl">
        <Link href={`/rfq?sku=${encodeURIComponent(model)}`} aria-label={`Ask for price: ${productName}`}>
          <FileText className="size-4" aria-hidden="true" />
          Ask for price
        </Link>
      </Button>
    );
  }

  const handleClick = () => {
    addItem(productId, 1);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <Button
      type="button"
      className="relative z-10 mt-3 h-11 w-full rounded-xl"
      disabled={disabled}
      onClick={handleClick}
      aria-label={`Add to cart: ${productName}`}
      data-product-id={productId}
    >
      {done ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <ShoppingBag className="size-4" aria-hidden="true" />
      )}
      {disabled ? "Out of Stock" : done ? "Added" : "Add to Cart"}
    </Button>
  );
};

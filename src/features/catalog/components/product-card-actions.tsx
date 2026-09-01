"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Eye, FileText, Heart, ShoppingBag } from "lucide-react";

import { useCart } from "@/features/cart/components/cart-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/features/catalog/types";

/**
 * Card hover actions — floating top-right action pills.
 */
export function CardActions({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView: () => void;
}) {
  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 opacity-0 transition-all duration-200 [.group:hover_&]:opacity-100 [.group:focus-within_&]:opacity-100 [@media(hover:none)]:opacity-100!">
      <WishlistButton productId={product.id} productName={product.name} />

      <ActionButton label={`Quick view: ${product.name}`} onClick={onQuickView}>
        <Eye className="size-3.5" aria-hidden="true" />
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
      className="grid size-8.5 place-items-center rounded-full border border-border/70 bg-background/95 text-muted-foreground shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-primary/50 hover:bg-background hover:text-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transform-none"
    >
      {children}
    </button>
  );
}

/**
 * Wishlist toggle button.
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
        saved
          ? `Remove ${productName} from wishlist`
          : `Save ${productName} to wishlist`
      }
      title={saved ? "Saved to wishlist" : "Save to wishlist"}
      data-product-id={productId}
      className="grid size-8.5 place-items-center rounded-full border border-border/70 bg-background/95 shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-110 hover:border-primary/50 hover:bg-background hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transform-none"
    >
      <Heart
        className={cn(
          "size-3.5 transition-colors duration-200",
          saved ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500",
        )}
        strokeWidth={2}
        aria-hidden="true"
      />
    </button>
  );
};

/**
 * Primary card action button (Add to Cart / Request Quote).
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
      <Button
        asChild
        variant="outline"
        size="sm"
        className="relative z-10 h-8.5 w-full rounded-full border-border/80 font-medium text-xs hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-200"
      >
        <Link
          href={`/rfq?sku=${encodeURIComponent(model)}`}
          aria-label={`Request quote for: ${productName}`}
          className="inline-flex items-center justify-center gap-1.5"
        >
          <FileText className="size-3.5" aria-hidden="true" />
          <span>Request Quote</span>
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
      size="sm"
      className={cn(
        "relative z-10 h-8.5 w-full rounded-full font-medium text-xs transition-all duration-200 shadow-xs",
        done ? "bg-emerald-600 text-white hover:bg-emerald-700" : "shadow-primary/20",
      )}
      disabled={disabled}
      onClick={handleClick}
      aria-label={`Add to cart: ${productName}`}
      data-product-id={productId}
    >
      {done ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <ShoppingBag className="size-3.5" aria-hidden="true" />
      )}
      <span>{disabled ? "Out of Stock" : done ? "Added to Cart" : "Add to Cart"}</span>
    </Button>
  );
};

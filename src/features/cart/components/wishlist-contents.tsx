"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { useCart } from "@/features/cart/components/cart-provider";
import { ProductCard } from "@/features/catalog/components/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { isAddable } from "@/features/cart/services/cart";
import type { Product } from "@/features/catalog/types";

/**
 * Saved items.
 *
 * Reuses `ProductCard` rather than inventing a wishlist-specific card, so a
 * saved product looks and behaves exactly as it did on the listing — same
 * price rules, same add button, same quote routing. The heart on each card is
 * already the toggle, so removing an item needs no extra control.
 *
 * "Add everything" skips quote-only and out-of-stock items, because neither
 * can go in a basket. It says how many it added rather than silently doing
 * less than the label promises.
 */
export function WishlistContents({ products }: { products: Product[] }) {
  const { wishlist, addItem } = useCart();

  const saved = products.filter((product) => wishlist.includes(product.id));
  const addable = saved.filter(isAddable);

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Nothing saved yet"
        description="Tap the heart on any product to keep it here. Your list stays on this device — no account needed."
        actions={
          <Button asChild size="lg">
            <Link href="/products">Browse products</Link>
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">
          {saved.length} {saved.length === 1 ? "item" : "items"} saved
        </p>

        {addable.length > 0 && (
          <Button
            variant="outline"
            onClick={() => addable.forEach((product) => addItem(product.id, 1))}
          >
            Add {addable.length === saved.length ? "all" : `${addable.length} available`} to cart
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {saved.map((product, index) => (
          <ProductCard key={product.id} product={product} tier="GUEST" priority={index < 4} />
        ))}
      </div>

      {addable.length < saved.length && (
        <p className="mt-6 text-sm text-muted-foreground">
          {saved.length - addable.length} of these are quote-only or out of stock and cannot be
          added to the cart —{" "}
          <Link href="/rfq" className="font-medium text-primary hover:underline">
            ask us for a price
          </Link>{" "}
          instead.
        </p>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Truck, X } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/cart";
import { formatBDT } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Cart and wishlist controls for the header, plus the slide-out basket.
 *
 * The badge counts come from `useSyncExternalStore`, which renders the server
 * snapshot (empty) during hydration and swaps to the real one immediately
 * after. That is what keeps a stored cart from causing a hydration mismatch.
 *
 * The free-delivery bar reflects a real commercial threshold rather than a
 * countdown or a fake scarcity device: it tells the shopper how much more they
 * would need to spend, and says so plainly once they are over the line.
 */
export function CartControls() {
  const { count, resolved, subtotal, wishlist, removeItem } = useCart();
  const [open, setOpen] = useState(false);

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/wishlist"
        aria-label={
          wishlist.length > 0
            ? `Wishlist, ${wishlist.length} ${wishlist.length === 1 ? "item" : "items"}`
            : "Wishlist"
        }
        className="relative grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Heart className="size-5" strokeWidth={1.75} aria-hidden="true" />
        {wishlist.length > 0 && <Badge>{wishlist.length}</Badge>}
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
            className="relative grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ShoppingBag className="size-5" strokeWidth={1.75} aria-hidden="true" />
            {count > 0 && <Badge>{count}</Badge>}
          </button>
        </SheetTrigger>

        <SheetContent className="flex w-[92vw] flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle className="text-base uppercase tracking-wide">Shopping cart</SheetTitle>
            <SheetDescription className="sr-only">
              Items you have added, with a link to checkout.
            </SheetDescription>
          </SheetHeader>

          {resolved.length > 0 && (
            <div className="border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <Truck className="size-5 shrink-0 text-emerald-600" strokeWidth={1.75} aria-hidden="true" />
              </div>

              <p className="mt-2 text-center text-sm text-muted-foreground">
                {remaining === 0 ? (
                  <span className="font-medium text-emerald-600">
                    Your order qualifies for free delivery.
                  </span>
                ) : (
                  <>
                    Spend <span className="font-medium text-foreground">{formatBDT(remaining)}</span>{" "}
                    more for free delivery.
                  </>
                )}
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5">
            {resolved.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingBag className="size-12 text-muted-foreground/30" strokeWidth={1.25} aria-hidden="true" />
                <p className="mt-4 font-medium">Your cart is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Instruments you add will appear here.
                </p>
                <Button asChild className="mt-6" onClick={() => setOpen(false)}>
                  <Link href="/products">Browse products</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y">
                {resolved.map((line) => (
                  <li key={line.product.id} className="flex gap-3 py-4">
                    <Link
                      href={`/product/${line.product.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-muted"
                    >
                      {line.product.imageUrl && (
                        <Image
                          src={line.product.imageUrl}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${line.product.slug}`}
                        onClick={() => setOpen(false)}
                        className="line-clamp-2 text-sm font-medium hover:text-primary"
                      >
                        {line.product.name}
                      </Link>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {line.quantity} ×{" "}
                        <span className="font-semibold text-primary">
                          {formatBDT(line.unitPrice)}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(line.product.id)}
                      aria-label={`Remove ${line.product.name} from cart`}
                      className="size-7 shrink-0 rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="mx-auto size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {resolved.length > 0 && (
            <div className="border-t px-5 py-4">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span className="text-primary">{formatBDT(subtotal)}</span>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Delivery calculated at checkout.
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button asChild variant="outline" size="lg" onClick={() => setOpen(false)}>
                  <Link href="/cart">View cart</Link>
                </Button>
                <Button asChild size="lg" onClick={() => setOpen(false)}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1",
        "text-[10px] font-semibold leading-4 text-primary-foreground",
      )}
    >
      {children}
    </span>
  );
}

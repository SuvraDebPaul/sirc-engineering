"use client";

import Image from "next/image";
import Link from "next/link";
import { Gift, Heart, Minus, Plus, RotateCcw, ShoppingBag, Truck, X } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { FREE_DELIVERY_THRESHOLD, MAX_QUANTITY } from "@/lib/cart";
import { formatBDT } from "@/lib/format";

/**
 * The cart page: line table on the left, totals on the right.
 *
 * The reference design carries a coupon box. There is no discount engine and
 * no codes, so it is absent rather than present-and-inert — a coupon field
 * that rejects every code is worse than none, because the shopper assumes
 * they have the wrong code rather than that the feature does not exist.
 *
 * Totals are computed from live catalogue prices every render, so a price
 * change between adding and checking out shows the new figure rather than a
 * stale one the customer would then dispute.
 */
const ASSURANCES = [
  { icon: Heart, title: "Bought by engineers", body: "Specified and supported by people who use these instruments." },
  { icon: RotateCcw, title: "7-day returns", body: "Unused stock in original packaging, no questions." },
  { icon: Gift, title: "Certificate included", body: "Every instrument ships calibrated and certified." },
];

export function CartContents() {
  const { resolved, subtotal, setQuantity, removeItem, toggleWishlist, isWishlisted } = useCart();

  if (resolved.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Nothing added yet. Browse the catalogue, or if you already know the model you need, send it to us for a quotation."
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/products">Browse products</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/rfq">Request a quotation</Link>
            </Button>
          </>
        }
      />
    );
  }

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="min-w-0">
        <h2 className="text-lg font-bold uppercase tracking-tight">Cart summary</h2>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-2xl border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th scope="col" className="w-10 pb-3" />
                <th scope="col" className="pb-3 font-medium">Product</th>
                <th scope="col" className="pb-3 font-medium">Price</th>
                <th scope="col" className="pb-3 font-medium">Quantity</th>
                <th scope="col" className="pb-3 text-right font-medium">Subtotal</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {resolved.map((line) => (
                <tr key={line.product.id}>
                  <td className="py-4">
                    <button
                      type="button"
                      onClick={() => removeItem(line.product.id)}
                      aria-label={`Remove ${line.product.name} from cart`}
                      className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/product/${line.product.slug}`}
                        className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted"
                      >
                        {line.product.imageUrl && (
                          <Image
                            src={line.product.imageUrl}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </Link>

                      <div className="min-w-0">
                        <Link
                          href={`/product/${line.product.slug}`}
                          className="line-clamp-2 font-medium hover:text-primary"
                        >
                          {line.product.name}
                        </Link>

                        <button
                          type="button"
                          onClick={() => toggleWishlist(line.product.id)}
                          className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Heart
                            className={
                              isWishlisted(line.product.id)
                                ? "size-3 fill-red-500 text-red-500"
                                : "size-3"
                            }
                            aria-hidden="true"
                          />
                          {isWishlisted(line.product.id) ? "Saved" : "Save for later"}
                        </button>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 font-semibold text-primary">{formatBDT(line.unitPrice)}</td>

                  <td className="py-4">
                    <div className="inline-flex items-center rounded-lg border" role="group" aria-label={`Quantity for ${line.product.name}`}>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.product.id, line.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="grid size-9 place-items-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </button>

                      <span className="w-10 text-center text-sm font-medium tabular-nums">
                        {line.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => setQuantity(line.product.id, line.quantity + 1)}
                        disabled={line.quantity >= MAX_QUANTITY}
                        aria-label="Increase quantity"
                        className="grid size-9 place-items-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>

                  <td className="py-4 text-right font-semibold">{formatBDT(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-8 grid gap-4 rounded-2xl bg-muted/40 p-6 sm:grid-cols-3">
          {ASSURANCES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="text-center">
              <Icon className="mx-auto size-6 text-primary" strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </div>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-dashed p-5">
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
                Spend <span className="font-medium text-foreground">{formatBDT(remaining)}</span> more
                for free delivery.
              </>
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-muted/40 p-6">
          <h2 className="text-lg font-bold uppercase tracking-tight">Cart totals</h2>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="font-medium">Subtotal</dt>
              <dd className="font-semibold text-primary">{formatBDT(subtotal)}</dd>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="text-muted-foreground">Chosen at checkout</dd>
            </div>
          </dl>

          <Button asChild size="lg" className="mt-6 h-12 w-full text-base">
            <Link href="/checkout">Proceed to checkout</Link>
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            No card details are taken online. We confirm your order and invoice you.
          </p>
        </div>
      </aside>
    </div>
  );
}

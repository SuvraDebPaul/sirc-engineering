"use client";

import { useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";

import { placeOrder } from "@/features/cart/actions/place-order";
import { useCart } from "@/features/cart/components/cart-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { DELIVERY_OPTIONS, deliveryCost } from "@/features/cart/services/cart";
import { PAYMENT_METHODS, emptyCheckoutState } from "@/features/cart/services/checkout";
import { formatBDT } from "@/lib/format";
import { useState } from "react";

/**
 * Checkout — billing details on the left, order summary on the right.
 *
 * **No card fields.** There is no payment processor connected to this site, so
 * every settlement method here happens off the website: bank transfer, a
 * purchase order, or cash on delivery. A form that looked like it took card
 * details but only logged them would be the most dangerous thing that could
 * ship, and adding one later means handing the customer to a processor's own
 * hosted page — never collecting a card number in these inputs.
 *
 * The cart is posted as a JSON summary so the order record includes what the
 * customer actually saw. It is evidence, not pricing: the server must re-price
 * from the catalogue before invoicing, since anything posted from a browser
 * can be edited.
 */
export function CheckoutForm() {
  const { resolved, subtotal, clearCart } = useCart();
  const [state, formAction, isPending] = useActionState(placeOrder, emptyCheckoutState);
  const [delivery, setDelivery] = useState<string>(DELIVERY_OPTIONS[0].value);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
  }, [state]);

  // Emptying the cart is a side effect of a successful order, not of rendering
  // the success screen — keyed on status so it runs once.
  useEffect(() => {
    if (state.status === "success") clearCart();
  }, [state.status, clearCart]);

  if (state.status === "success") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto size-14 text-emerald-500" strokeWidth={1.5} aria-hidden="true" />

        <h2 className="mt-5 text-2xl font-semibold tracking-tight">Order received</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Your reference is{" "}
          <span className="font-mono font-semibold text-foreground">{state.reference}</span>.
        </p>

        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Nothing has been charged. Our sales desk will confirm stock and lead time, then send an
          invoice with payment details. You can reply to that email to change anything.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/products">Continue browsing</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <EmptyState
        className="mx-auto max-w-xl"
        title="Your cart is empty"
        description="Add something to the cart before checking out."
        actions={
          <Button asChild size="lg">
            <Link href="/products">Browse products</Link>
          </Button>
        }
      />
    );
  }

  const { errors, values } = state;
  const hasErrors = Object.keys(errors).length > 0;
  const shipping = deliveryCost(delivery as never, subtotal);
  const total = subtotal + shipping;

  return (
    <form action={formAction} noValidate className="grid gap-8 lg:grid-cols-[1fr_23rem]">
      {/* What the customer saw. Evidence for the sales desk, never trusted as price. */}
      <input
        type="hidden"
        name="cart"
        value={JSON.stringify(
          resolved.map((line) => ({
            id: line.product.id,
            model: line.product.modelNumber,
            name: line.product.name,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
          })),
        )}
      />

      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="checkout-website">Leave this field empty</label>
        <input id="checkout-website" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="min-w-0">
        <h2 className="text-lg font-bold uppercase tracking-tight">Billing details</h2>

        {hasErrors && (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="mt-5 flex gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            <p className="font-medium text-destructive">
              {errors.form ?? errors.cart ?? "Please check the highlighted fields."}
            </p>
          </div>
        )}

        <div className="mt-5 grid gap-5 rounded-2xl border p-6 sm:grid-cols-2">
          <FormField
            name="firstName"
            label="First name"
            required
            error={errors.firstName}
          >
            {(props) => (
              <Input
                {...props}
                autoComplete="given-name"
                defaultValue={values.firstName}
              />
            )}
          </FormField>
          <FormField
            name="lastName"
            label="Last name"
            error={errors.lastName}
          >
            {(props) => (
              <Input
                {...props}
                autoComplete="family-name"
                defaultValue={values.lastName}
              />
            )}
          </FormField>
          <FormField
            name="company"
            label="Company"
            error={errors.company}
            className="sm:col-span-2"
          >
            {(props) => (
              <Input
                {...props}
                autoComplete="organization"
                defaultValue={values.company}
              />
            )}
          </FormField>
          <FormField
            name="phone"
            label="Phone"
            required
            error={errors.phone}
          >
            {(props) => (
              <Input
                {...props}
                type="tel"
                autoComplete="tel"
                defaultValue={values.phone}
              />
            )}
          </FormField>
          <FormField
            name="email"
            label="Email address"
            required
            error={errors.email}
          >
            {(props) => (
              <Input
                {...props}
                type="email"
                autoComplete="email"
                defaultValue={values.email}
              />
            )}
          </FormField>
          <FormField
            name="address"
            label="Address"
            required
            error={errors.address}
            className="sm:col-span-2"
          >
            {(props) => (
              <Input
                {...props}
                placeholder="House number, road, area"
                autoComplete="street-address"
                defaultValue={values.address}
              />
            )}
          </FormField>
          <FormField name="city" label="City / town" required error={errors.city}>
            {(props) => (
              <Input {...props} autoComplete="address-level2" defaultValue={values.city} />
            )}
          </FormField>
          <FormField
            name="district"
            label="District"
            required
            error={errors.district}
          >
            {(props) => (
              <Input
                {...props}
                autoComplete="address-level1"
                defaultValue={values.district}
              />
            )}
          </FormField>
          <FormField
            name="postcode"
            label="Postcode"
            error={errors.postcode}
          >
            {(props) => (
              <Input
                {...props}
                autoComplete="postal-code"
                defaultValue={values.postcode}
              />
            )}
          </FormField>
        </div>

        <div className="mt-5 rounded-2xl border p-6">
          <FormField name="notes" label="Order notes (optional)">
            {(props) => (
              <Textarea
                {...props}
                rows={4}
                defaultValue={values.notes}
                placeholder="Delivery instructions, site contact, PO number, required certificate dates…"
              />
            )}
          </FormField>
        </div>
      </div>

      <aside className="space-y-5">
        <div className="rounded-2xl border bg-muted/30 p-6">
          <h2 className="text-lg font-bold uppercase tracking-tight">Your order</h2>

          <ul className="mt-5 divide-y">
            {resolved.map((line) => (
              <li key={line.product.id} className="flex gap-3 py-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {line.product.imageUrl && (
                    <Image src={line.product.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                  )}
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {line.quantity}
                  </span>
                </div>

                <p className="min-w-0 flex-1 text-sm leading-snug">{line.product.name}</p>

                <p className="shrink-0 text-sm font-semibold">{formatBDT(line.lineTotal)}</p>
              </li>
            ))}
          </ul>

          <fieldset className="mt-5 border-t pt-4">
            <legend className="text-sm font-semibold">Delivery</legend>

            <div className="mt-3 space-y-2">
              {DELIVERY_OPTIONS.map((option) => {
                const cost = deliveryCost(option.value, subtotal);

                return (
                  <label key={option.value} className="flex cursor-pointer items-start gap-2.5 text-sm">
                    <input
                      type="radio"
                      name="delivery"
                      value={option.value}
                      checked={delivery === option.value}
                      onChange={() => setDelivery(option.value)}
                      className="mt-0.5 size-4 shrink-0 accent-primary"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex justify-between gap-2">
                        <span>{option.label}</span>
                        <span className="font-medium">{cost === 0 ? "Free" : formatBDT(cost)}</span>
                      </span>
                      <span className="block text-xs text-muted-foreground">{option.note}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatBDT(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{shipping === 0 ? "Free" : formatBDT(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="text-primary">{formatBDT(total)}</dd>
            </div>
          </dl>

          <fieldset className="mt-5 border-t pt-4">
            <legend className="text-sm font-semibold">How would you like to pay?</legend>

            <div className="mt-3 space-y-3">
              {PAYMENT_METHODS.map((method, index) => (
                <label key={method.value} className="flex cursor-pointer items-start gap-2.5 text-sm">
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    defaultChecked={values.payment ? values.payment === method.value : index === 0}
                    className="mt-0.5 size-4 shrink-0 accent-primary"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium">{method.label}</span>
                    <span className="block text-xs text-muted-foreground">{method.note}</span>
                  </span>
                </label>
              ))}
            </div>

            {errors.payment && <p className="mt-2 text-sm text-destructive">{errors.payment}</p>}
          </fieldset>

          <Button type="submit" size="lg" disabled={isPending} className="mt-6 h-12 w-full text-base">
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
            {isPending ? "Placing order…" : "Place order"}
          </Button>

          <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            <span>
              No card details are collected on this site. We confirm stock, then send an invoice
              with payment instructions. Nothing is charged now.
            </span>
          </p>
        </div>
      </aside>
    </form>
  );
}


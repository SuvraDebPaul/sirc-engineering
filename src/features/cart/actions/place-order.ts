"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/db/auth";
import { createOrder, EmptyOrderError } from "@/features/orders/services/order-create";
import { validateCheckout, type CheckoutState } from "@/features/cart/services/checkout";
import { checkRateLimit, getClientIp, rateLimitMessage } from "@/lib/rate-limit";

const ECHOED = [
  "firstName", "lastName", "company", "phone", "email",
  "address", "city", "district", "postcode", "delivery", "payment", "notes",
];

const echo = (formData: FormData): Record<string, string> => {
  const values: Record<string, string> = {};
  for (const key of ECHOED) {
    const value = formData.get(key);
    if (typeof value === "string") values[key] = value;
  }
  return values;
};

interface SeenCartLine {
  id: string;
  quantity: number;
}

const isSeenCartLine = (value: unknown): value is SeenCartLine =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as SeenCartLine).id === "string" &&
  Number.isFinite((value as SeenCartLine).quantity);

/**
 * Place an order.
 *
 * The cart is submitted as a serialised summary from the client rather than
 * being trusted as prices: every line is re-priced server-side from the
 * catalogue in `createOrder`, because anything posted from a browser can be
 * edited. The line data here is a record of what the customer *saw*, which is
 * worth keeping only for `id`/`quantity` — never for the price it carries.
 *
 * No payment is taken — cash on delivery is the only method offered and it
 * settles in person, so there's nothing here to confirm.
 */
export async function placeOrder(
  _previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  if (formData.get("website") !== "") {
    return { status: "success", errors: {}, values: {}, reference: "ORD-00000000-000" };
  }

  // Ten orders per ten minutes per IP — loose enough for a real customer
  // reordering or fixing a typo, tight enough to stop a script from filling
  // the order queue. The honeypot above catches naive bots; this catches
  // ones that fill every field.
  const ip = await getClientIp();
  const limit = checkRateLimit(`order:${ip}`, 10, 10 * 60 * 1000);
  if (!limit.ok) {
    return {
      status: "error",
      errors: { form: rateLimitMessage(limit.retryAfterSeconds!) },
      values: echo(formData),
    };
  }

  const cartRaw = formData.get("cart");
  const cart = typeof cartRaw === "string" ? cartRaw : "";

  if (cart === "" || cart === "[]") {
    return {
      status: "error",
      errors: { cart: "Your cart is empty." },
      values: echo(formData),
    };
  }

  let parsedCart: unknown;
  try {
    parsedCart = JSON.parse(cart);
  } catch {
    parsedCart = [];
  }

  const lines = Array.isArray(parsedCart)
    ? parsedCart
        .filter(isSeenCartLine)
        .map((line) => ({ productId: line.id, quantity: line.quantity }))
    : [];

  const result = validateCheckout(formData);

  if (!result.ok) {
    return { status: "error", errors: result.errors, values: echo(formData) };
  }

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const order = await createOrder(result.data, lines, session?.user.id ?? null);

    return { status: "success", errors: {}, values: {}, reference: order.reference };
  } catch (error) {
    if (error instanceof EmptyOrderError) {
      return {
        status: "error",
        errors: { cart: "None of the items in your cart could be ordered. Please refresh and try again." },
        values: echo(formData),
      };
    }
    return {
      status: "error",
      errors: { form: "We could not place your order just now. Please try again, or call us." },
      values: echo(formData),
    };
  }
}

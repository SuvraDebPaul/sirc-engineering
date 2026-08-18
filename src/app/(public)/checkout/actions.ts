"use server";

import { deliverEnquiry } from "@/lib/enquiry-delivery";
import { validateCheckout, type CheckoutState } from "@/lib/checkout";

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

/**
 * Place an order.
 *
 * The cart is submitted as a serialised summary from the client rather than
 * being trusted as prices: a real implementation must re-price every line
 * server-side from the catalogue before invoicing, because anything posted
 * from a browser can be edited. The line data here is a record of what the
 * customer *saw*, which is worth keeping for exactly that comparison.
 *
 * No payment is taken. The order goes to the sales desk, who confirm stock and
 * issue an invoice.
 */
export async function placeOrder(
  _previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  if (formData.get("website") !== "") {
    return { status: "success", errors: {}, values: {}, reference: "ORD-00000000-000" };
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

  const result = validateCheckout(formData);

  if (!result.ok) {
    return { status: "error", errors: result.errors, values: echo(formData) };
  }

  try {
    const reference = await deliverEnquiry("order", {
      ...result.data,
      // TODO: re-price these lines against the catalogue before invoicing.
      cartAsSeenByCustomer: cart,
    });

    return { status: "success", errors: {}, values: {}, reference };
  } catch {
    return {
      status: "error",
      errors: { form: "We could not place your order just now. Please try again, or call us." },
      values: echo(formData),
    };
  }
}

import { prisma } from "@/lib/db/prisma";
import { buildReference } from "@/features/enquiries/services/enquiry-delivery";
import { orderConfirmationEmail, orderNotificationEmail } from "@/features/orders/services/order-emails";
import { deliveryCost, type DeliveryValue } from "@/features/cart/services/cart";
import type { CheckoutDetails } from "@/features/cart/services/checkout";
import { sendEmail } from "@/lib/email";
import { contactInfo } from "@/config/site";
import { logUnexpectedError } from "@/lib/log-unexpected-error";

export interface OrderLineInput {
  productId: string;
  quantity: number;
}

/** Thrown when none of the submitted lines resolve to a purchasable product — a stale or tampered cart, never a valid order. */
export class EmptyOrderError extends Error {}

/**
 * Create an order from checkout details and the cart the customer saw.
 *
 * The client-submitted lines carry only an id and a quantity — every price
 * comes from the live `Product` record at the moment of order, never from
 * what the browser posted. This is the one place that re-pricing happens;
 * nothing upstream of this function should be trusted for money.
 */
export async function createOrder(
  details: CheckoutDetails,
  lines: OrderLineInput[],
  userId: string | null,
) {
  const productIds = [...new Set(lines.map((line) => line.productId))];
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const byId = new Map(products.map((product) => [product.id, product]));

  const items = lines.flatMap((line) => {
    const product = byId.get(line.productId);
    if (!product || product.retailPrice === null) return [];

    return [
      {
        productId: product.id,
        productName: product.name,
        modelNumber: product.modelNumber,
        unitPrice: product.retailPrice,
        quantity: Math.min(99, Math.max(1, Math.floor(line.quantity))),
      },
    ];
  });

  if (items.length === 0) throw new EmptyOrderError("No purchasable items in cart.");

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const deliveryFee = deliveryCost(details.delivery as DeliveryValue);
  const total = subtotal + deliveryFee;

  const order = await prisma.order.create({
    data: {
      reference: buildReference("ORD"),
      firstName: details.firstName,
      lastName: details.lastName,
      company: details.company,
      phone: details.phone,
      email: details.email,
      address: details.address,
      city: details.city,
      district: details.district,
      postcode: details.postcode,
      delivery: details.delivery,
      payment: details.payment,
      notes: details.notes,
      subtotal,
      deliveryFee,
      total,
      userId,
      items: { create: items },
    },
    include: { items: true },
  });

  // Email is best-effort: a Resend hiccup must not fail a placed order, since
  // the row already exists and both the customer's reference screen and the
  // admin order list still show it either way. Each send has its own
  // try/catch so one failing (a bad customer address, a sandbox rejection)
  // never stops the other from being attempted.
  try {
    const confirmation = orderConfirmationEmail(order);
    await sendEmail({ to: order.email, subject: confirmation.subject, html: confirmation.html });
  } catch (error) {
    logUnexpectedError("order-email:confirmation", error);
  }

  try {
    const notification = orderNotificationEmail(order);
    await sendEmail({ to: contactInfo.email, subject: notification.subject, html: notification.html });
  } catch (error) {
    logUnexpectedError("order-email:notification", error);
  }

  return order;
}

import { escapeHtml } from "@/lib/escape-html";
import { formatBDT } from "@/lib/format";

interface OrderItemFields {
  productName: string;
  modelNumber: string;
  unitPrice: number;
  quantity: number;
}

interface OrderFields {
  reference: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  postcode: string;
  notes: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: OrderItemFields[];
}

const itemRows = (items: OrderItemFields[]) =>
  items
    .map(
      (item) => `
        <tr>
          <td style="padding:6px 12px 6px 0;font-size:13px;">${escapeHtml(item.productName)} <span style="color:#999;">× ${item.quantity}</span></td>
          <td style="padding:6px 0;font-size:13px;text-align:right;white-space:nowrap;">${formatBDT(item.unitPrice * item.quantity)}</td>
        </tr>`,
    )
    .join("");

const totalsRows = (order: OrderFields) => `
  <tr><td style="padding:4px 12px 4px 0;font-size:13px;color:#666;">Subtotal</td><td style="padding:4px 0;font-size:13px;text-align:right;">${formatBDT(order.subtotal)}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;font-size:13px;color:#666;">Delivery</td><td style="padding:4px 0;font-size:13px;text-align:right;">${order.deliveryFee === 0 ? "Free" : formatBDT(order.deliveryFee)}</td></tr>
  <tr><td style="padding:8px 12px 0 0;font-size:14px;font-weight:600;">Total</td><td style="padding:8px 0 0;font-size:14px;font-weight:600;text-align:right;">${formatBDT(order.total)}</td></tr>
`;

const addressBlock = (order: OrderFields) => `
  ${escapeHtml(order.firstName)} ${escapeHtml(order.lastName)}${order.company ? ` · ${escapeHtml(order.company)}` : ""}<br>
  ${escapeHtml(order.address)}, ${escapeHtml(order.city)}, ${escapeHtml(order.district)} ${escapeHtml(order.postcode)}<br>
  ${escapeHtml(order.phone)}
`;

/** Sent to the customer immediately after checkout, confirming what was ordered and that nothing has been charged. */
export function orderConfirmationEmail(order: OrderFields): { subject: string; html: string } {
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 18px; margin: 0 0 4px;">Thanks, ${escapeHtml(order.firstName)}</h1>
      <p style="color: #555; font-size: 14px; line-height: 1.5; margin: 0 0 20px;">
        We've received your order. Nothing has been charged — our sales desk will confirm stock and
        lead time, then send an invoice with payment instructions.
      </p>
      <p style="color: #999; font-size: 12px; margin: 0 0 20px;">Reference ${order.reference}</p>

      <table style="border-collapse: collapse; width: 100%;">${itemRows(order.items)}</table>
      <table style="border-collapse: collapse; width: 100%; margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">${totalsRows(order)}</table>

      <p style="color: #666; font-size: 13px; margin: 20px 0 4px;">Delivering to</p>
      <p style="font-size: 13px; line-height: 1.6; margin: 0;">${addressBlock(order)}</p>
    </div>
  `;

  return { subject: `Order received — ${order.reference}`, html };
}

/** Notifies the business a new order has arrived. */
export function orderNotificationEmail(order: OrderFields): { subject: string; html: string } {
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 18px; margin: 0 0 4px;">New order</h1>
      <p style="color: #999; font-size: 12px; margin: 0 0 20px;">Reference ${order.reference}</p>

      <table style="border-collapse: collapse; width: 100%;">${itemRows(order.items)}</table>
      <table style="border-collapse: collapse; width: 100%; margin-top: 8px; border-top: 1px solid #eee; padding-top: 8px;">${totalsRows(order)}</table>

      <p style="color: #666; font-size: 13px; margin: 20px 0 4px;">Customer</p>
      <p style="font-size: 13px; line-height: 1.6; margin: 0;">
        ${escapeHtml(order.email)}<br>
        ${addressBlock(order)}
      </p>

      ${
        order.notes
          ? `<p style="color: #666; font-size: 13px; margin: 20px 0 4px;">Notes</p>
             <p style="font-size: 13px; line-height: 1.5; white-space: pre-wrap; margin: 0; padding: 12px; background: #f4f4f5; border-radius: 8px;">${escapeHtml(order.notes)}</p>`
          : ""
      }
    </div>
  `;

  return { subject: `New order — ${order.reference}`, html };
}

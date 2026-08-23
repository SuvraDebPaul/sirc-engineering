import type { EnquiryKind } from "@/features/enquiries/services/enquiry-delivery";
import { escapeHtml } from "@/lib/escape-html";

const KIND_LABEL: Record<EnquiryKind, string> = {
  quotation: "Quotation request",
  contact: "Contact message",
  comment: "Blog comment",
};

const row = (label: string, value: string | number | undefined | null) =>
  value === undefined || value === null || value === ""
    ? ""
    : `<tr><td style="padding:4px 12px 4px 0;color:#666;font-size:13px;white-space:nowrap;">${escapeHtml(label)}</td><td style="padding:4px 0;font-size:13px;">${escapeHtml(String(value))}</td></tr>`;

/**
 * Notifies the business a new enquiry has arrived.
 *
 * Sent for every kind — the recipient is staff, not the visitor, so there is
 * no risk of over-communicating with a customer.
 */
export function enquiryNotificationEmail(
  kind: EnquiryKind,
  reference: string,
  fields: {
    name: string;
    email: string;
    phone?: string | null;
    message: string;
    details?: Record<string, unknown>;
  },
): { subject: string; html: string } {
  const detailRows = Object.entries(fields.details ?? {})
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => row(key, String(value)))
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 18px; margin: 0 0 4px;">New ${KIND_LABEL[kind].toLowerCase()}</h1>
      <p style="color: #999; font-size: 12px; margin: 0 0 20px;">Reference ${reference}</p>
      <table style="border-collapse: collapse; width: 100%;">
        ${row("Name", fields.name)}
        ${row("Email", fields.email)}
        ${row("Phone", fields.phone)}
        ${detailRows}
      </table>
      <p style="color: #666; font-size: 13px; margin: 20px 0 4px;">Message</p>
      <p style="font-size: 14px; line-height: 1.5; white-space: pre-wrap; margin: 0; padding: 12px; background: #f4f4f5; border-radius: 8px;">${escapeHtml(fields.message)}</p>
    </div>
  `;

  return { subject: `${KIND_LABEL[kind]} — ${reference}`, html };
}

/** Sent to the visitor for quotation and contact submissions, confirming their reference. */
export function enquiryConfirmationEmail(
  kind: "quotation" | "contact",
  reference: string,
  name: string,
): { subject: string; html: string } {
  const subject =
    kind === "quotation" ? "We've received your quotation request — SIRC" : "We've received your message — SIRC";

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 18px; margin: 0 0 12px;">Thanks, ${escapeHtml(name)}</h1>
      <p style="color: #555; font-size: 14px; line-height: 1.5;">
        ${
          kind === "quotation"
            ? "We've received your quotation request and will get back to you shortly."
            : "We've received your message and will get back to you shortly."
        }
      </p>
      <p style="font-size: 13px; color: #999; margin: 24px 0 0;">Your reference: <strong style="color:#333;">${reference}</strong></p>
    </div>
  `;

  return { subject, html };
}

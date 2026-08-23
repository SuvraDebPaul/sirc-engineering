import { Prisma, prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email";
import { contactInfo } from "@/config/site";
import { enquiryConfirmationEmail, enquiryNotificationEmail } from "@/features/enquiries/services/enquiry-emails";
import { logUnexpectedError } from "@/lib/log-unexpected-error";

/**
 * Every message a visitor can send — a quotation request, a contact enquiry,
 * a comment held for moderation — arrives here. Each one is validated by its
 * own feature module, then handed off with a common shape: `name`, `email`,
 * an optional `phone`, a `message`, and a `details` bag for whatever else is
 * specific to that kind (company/sku/quantity for a quotation, a subject
 * line for a contact message, the post it's replying to for a comment).
 *
 * The `kind` discriminator is what staff use to triage in `/admin/enquiries`:
 * quotations and contact messages get a confirmation email back to the
 * visitor; all three notify the business inbox and are stored so nothing is
 * ever only visible in a server log.
 */
export type EnquiryKind = "quotation" | "contact" | "comment";

export interface EnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  message: string;
  /** Kind-specific extra fields — shown in the admin detail view and the notification email. */
  details?: Record<string, unknown>;
}

/**
 * Reference the customer can quote back at us.
 *
 * Date-prefixed so a reference read out over the phone narrows the search to
 * one day before anything is looked up.
 */
export const buildReference = (prefix: string, now = new Date()): string => {
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `${prefix}-${date}-${suffix}`;
};

const PREFIX: Record<EnquiryKind, string> = {
  quotation: "RFQ",
  contact: "MSG",
  comment: "CMT",
};

export async function deliverEnquiry(kind: EnquiryKind, payload: EnquiryPayload): Promise<string> {
  const reference = buildReference(PREFIX[kind]);
  const { name, email, phone, message, details } = payload;

  // The row is the source of truth for admin visibility — this must succeed
  // for the function to report success back to the visitor.
  await prisma.enquiry.create({
    data: {
      reference,
      kind,
      name,
      email,
      phone: phone ?? null,
      message,
      details: (details ?? {}) as Prisma.InputJsonValue,
    },
  });

  // Email is best-effort: a Resend hiccup must not make a saved enquiry look
  // like it failed to the visitor, since the row already exists and staff
  // can still see it in the admin list. Each send has its own try/catch so
  // one failing never stops the other from being attempted.
  try {
    const notification = enquiryNotificationEmail(kind, reference, { name, email, phone, message, details });
    await sendEmail({ to: contactInfo.email, subject: notification.subject, html: notification.html });
  } catch (error) {
    logUnexpectedError(`enquiry-email:${kind}:notification`, error);
  }

  if (kind === "quotation" || kind === "contact") {
    try {
      const confirmation = enquiryConfirmationEmail(kind, reference, name);
      await sendEmail({ to: email, subject: confirmation.subject, html: confirmation.html });
    } catch (error) {
      logUnexpectedError(`enquiry-email:${kind}:confirmation`, error);
    }
  }

  return reference;
}

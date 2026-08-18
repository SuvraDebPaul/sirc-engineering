/**
 * ⚠️ **The single unwired seam in the application.**
 *
 * Every message a visitor can send — a quotation request, a contact enquiry, a
 * comment held for moderation — arrives here. Right now each one is validated,
 * given a reference and written to the server log, and that is all. Nothing is
 * emailed, nothing is stored, and nothing survives a restart.
 *
 * There was briefly a separate seam per form. That is three things to remember
 * at launch and three chances to wire two of them and forget the third, so
 * they were collapsed into this one function. Replace the body — an email
 * send, a row in an enquiries table, a CRM lead — and every form on the site
 * is live at once.
 *
 * The `kind` discriminator is what a real implementation routes on: quotations
 * and orders to sales, comments to a moderation queue, contact enquiries to
 * the front desk.
 */
export type EnquiryKind = "quotation" | "contact" | "comment" | "order" | "question";

export interface DeliveredEnquiry {
  kind: EnquiryKind;
  reference: string;
  receivedAt: string;
  payload: Record<string, unknown>;
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
  order: "ORD",
  question: "QRY",
};

export async function deliverEnquiry(
  kind: EnquiryKind,
  payload: Record<string, unknown>,
): Promise<string> {
  const reference = buildReference(PREFIX[kind]);

  // TODO: replace with the real destination (email / database / CRM).
  console.info(`[enquiry:${kind}] received`, {
    reference,
    receivedAt: new Date().toISOString(),
    ...payload,
  });

  return reference;
}

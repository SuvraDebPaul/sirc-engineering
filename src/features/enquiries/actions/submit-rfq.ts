"use server";

import {
  validateQuoteRequest,
  type QuoteFormState,
} from "@/features/enquiries/services/rfq";
import { deliverEnquiry } from "@/features/enquiries/services/enquiry-delivery";
import { checkRateLimit, getClientIp, rateLimitMessage } from "@/lib/rate-limit";

/**
 * Handle a quotation request.
 *
 * A Server Action rather than a route handler, so the form works before
 * hydration and keeps working if the JavaScript never arrives: the browser
 * posts it, the server answers with the rendered result. `useActionState`
 * upgrades that to an inline response once React is running.
 *
 * The visitor's answers are echoed back on failure. Re-rendering an empty form
 * after a validation error throws away everything they typed, which is a far
 * worse outcome than the error itself.
 */

/** Fields worth returning to the form. Never echo the consent checkbox. */
const ECHOED = [
  "name",
  "company",
  "department",
  "designation",
  "email",
  "phone",
  "enquiryType",
  "sku",
  "quantity",
  "message",
];

const echo = (formData: FormData): Record<string, string> => {
  const values: Record<string, string> = {};
  for (const key of ECHOED) {
    const value = formData.get(key);
    if (typeof value === "string") values[key] = value;
  }
  return values;
};

export async function submitQuoteRequest(
  _previous: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  // Honeypot. A field hidden from people but filled in by most naive bots;
  // it costs nothing, needs no third-party script, and asks nothing of the
  // visitor — unlike a CAPTCHA, which taxes every real customer to stop a bot.
  if (formData.get("website") !== "") {
    // Answer as though it worked. Telling a bot precisely how it was caught
    // is the one thing that would help it get past this next time.
    return { status: "success", errors: {}, values: {}, reference: "RFQ-00000000-000" };
  }

  // Five requests per ten minutes per IP — enough for a real buyer to retry a
  // typo, not enough for a scraper to fill the enquiries inbox.
  const ip = await getClientIp();
  const limit = checkRateLimit(`rfq:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return {
      status: "error",
      errors: { form: rateLimitMessage(limit.retryAfterSeconds!) },
      values: echo(formData),
    };
  }

  const result = validateQuoteRequest(formData);

  if (!result.ok) {
    return { status: "error", errors: result.errors, values: echo(formData) };
  }

  try {
    const { name, email, phone, message, ...details } = result.data;
    const reference = await deliverEnquiry("quotation", { name, email, phone, message, details });
    return { status: "success", errors: {}, values: {}, reference };
  } catch {
    // The customer must not be told "sent" when it was not. Give them the
    // failure and the phone number, and keep what they typed.
    return {
      status: "error",
      errors: { form: "We could not submit your request just now. Please try again, or call us." },
      values: echo(formData),
    };
  }
}

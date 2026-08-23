"use server";

import { createQuestion } from "@/features/enquiries/services/product-questions";
import type { QuestionState } from "@/features/enquiries/services/questions";
import { checkRateLimit, getClientIp, rateLimitMessage } from "@/lib/rate-limit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const read = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

/**
 * Accept a pre-sales question about a product.
 *
 * Stored against the product itself now, not just logged — a staff member
 * answers it from the admin panel, and once answered it becomes the public
 * Q&A on that product's page. Carries the product id so the admin queue
 * never has to guess which product a question was about.
 */
export async function askProductQuestion(
  _previous: QuestionState,
  formData: FormData,
): Promise<QuestionState> {
  if (formData.get("website") !== "") {
    return { status: "success", errors: {}, values: {} };
  }

  // Five questions per ten minutes per IP — see the note in the RFQ action.
  const ip = await getClientIp();
  const limit = checkRateLimit(`product-question:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return {
      status: "error",
      errors: { form: rateLimitMessage(limit.retryAfterSeconds!) },
      values: { question: read(formData, "question"), email: read(formData, "email") },
    };
  }

  const question = read(formData, "question");
  const email = read(formData, "email");
  const productId = read(formData, "productId");

  const errors: QuestionState["errors"] = {};

  if (question.length < 10) errors.question = "Please give us a little more detail.";
  else if (question.length > 2000) errors.question = "Please keep this under 2,000 characters.";

  if (email === "") errors.email = "We need an email address to send the answer to.";
  else if (!EMAIL.test(email)) errors.email = "That does not look like an email address.";

  if (!productId) errors.form = "Something went wrong. Please reload the page and try again.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values: { question, email } };
  }

  try {
    await createQuestion(productId, { question, email });
    return { status: "success", errors: {}, values: {} };
  } catch {
    return {
      status: "error",
      errors: { form: "We could not send your question just now. Please try again." },
      values: { question, email },
    };
  }
}

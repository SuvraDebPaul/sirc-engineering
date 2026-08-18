"use server";

import { deliverEnquiry } from "@/features/enquiries/services/enquiry-delivery";
import type { QuestionState } from "@/features/enquiries/services/questions";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const read = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

/**
 * Accept a pre-sales question about a product.
 *
 * Carries the model number so the sales desk never has to ask "which one?" —
 * the single most common reason a technical enquiry takes two days instead of
 * ten minutes.
 */
export async function askProductQuestion(
  _previous: QuestionState,
  formData: FormData,
): Promise<QuestionState> {
  if (formData.get("website") !== "") {
    return { status: "success", errors: {}, values: {} };
  }

  const question = read(formData, "question");
  const email = read(formData, "email");
  const model = read(formData, "model");

  const errors: QuestionState["errors"] = {};

  if (question.length < 10) errors.question = "Please give us a little more detail.";
  else if (question.length > 2000) errors.question = "Please keep this under 2,000 characters.";

  if (email === "") errors.email = "We need an email address to send the answer to.";
  else if (!EMAIL.test(email)) errors.email = "That does not look like an email address.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values: { question, email } };
  }

  try {
    await deliverEnquiry("question", { model, question, email });
    return { status: "success", errors: {}, values: {} };
  } catch {
    return {
      status: "error",
      errors: { form: "We could not send your question just now. Please try again." },
      values: { question, email },
    };
  }
}

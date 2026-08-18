"use server";

import { deliverEnquiry } from "@/features/enquiries/services/enquiry-delivery";
import type { ContactFormState } from "@/features/enquiries/services/contact";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const read = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

/**
 * General contact enquiry.
 *
 * Lighter than the quotation form on purpose. Someone with a question should
 * not have to pick an enquiry type, supply a model number and agree to a
 * consent checkbox before they can ask it — that form exists at /rfq for
 * people who already know what they want.
 */
export async function submitContact(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot — see the note in the RFQ action.
  if (formData.get("website") !== "") {
    return { status: "success", errors: {}, values: {}, reference: "MSG-00000000-000" };
  }

  const name = read(formData, "name");
  const email = read(formData, "email");
  const phone = read(formData, "phone");
  const subject = read(formData, "subject");
  const message = read(formData, "message");

  const errors: ContactFormState["errors"] = {};

  if (name.length < 2) errors.name = "Please tell us your name.";
  else if (name.length > 100) errors.name = "That name is too long.";

  if (email === "") errors.email = "We need an email address to reply to.";
  else if (!EMAIL.test(email)) errors.email = "That does not look like an email address.";

  if (phone !== "" && phone.replace(/\D/g, "").length < 9) {
    errors.phone = "Please enter a valid phone number, or leave it blank.";
  }

  if (subject.length > 150) errors.subject = "That subject is too long.";

  if (message.length < 10) errors.message = "Please tell us a little more.";
  else if (message.length > 4000) errors.message = "Please keep this under 4,000 characters.";

  const values = { name, email, phone, subject, message };

  if (Object.keys(errors).length > 0) return { status: "error", errors, values };

  try {
    const reference = await deliverEnquiry("contact", values);
    return { status: "success", errors: {}, values: {}, reference };
  } catch {
    return {
      status: "error",
      errors: { form: "We could not send your message just now. Please try again, or call us." },
      values,
    };
  }
}

"use server";

import {
  deliverComment,
  validateComment,
  type CommentFormState,
} from "@/lib/comments";

const ECHOED = ["name", "email", "body"];

const echo = (formData: FormData): Record<string, string> => {
  const values: Record<string, string> = {};
  for (const key of ECHOED) {
    const value = formData.get(key);
    if (typeof value === "string") values[key] = value;
  }
  return values;
};

/**
 * Accept a comment for moderation.
 *
 * Same shape as the quotation action: a Server Action so the form posts
 * without JavaScript, with the visitor's text echoed back on failure.
 */
export async function submitComment(
  _previous: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  // Honeypot — see the note in the RFQ action.
  if (formData.get("website") !== "") {
    return { status: "success", errors: {}, values: {} };
  }

  const result = validateComment(formData);

  if (!result.ok) {
    return { status: "error", errors: result.errors, values: echo(formData) };
  }

  try {
    await deliverComment(result.data);
    return { status: "success", errors: {}, values: {} };
  } catch {
    return {
      status: "error",
      errors: { form: "We could not post your comment just now. Please try again." },
      values: echo(formData),
    };
  }
}

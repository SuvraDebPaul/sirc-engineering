import { deliverEnquiry } from "@/features/enquiries/services/enquiry-delivery";

/**
 * Article comments.
 *
 * ⚠️ **Not yet wired.** A submitted comment is validated, given an id and
 * written to the server log. Nothing is stored and nothing is published, which
 * is why the form tells the visitor their comment is held for moderation
 * rather than pretending it has appeared.
 *
 * No comments are displayed anywhere, and none are invented. The reference
 * design shows a thread of nine; fabricating discussion — names, opinions,
 * replies — on a business's own site is the one kind of placeholder content
 * that cannot be quietly shipped by accident.
 *
 * Replace `deliverComment` with the real destination. Whatever that is, it
 * must moderate before publishing: an unmoderated comment form on a public
 * site is a spam target within days.
 */
export interface CommentInput {
  postSlug: string;
  name: string;
  email: string;
  body: string;
}

export type CommentErrors = Partial<Record<keyof CommentInput | "form", string>>;

export interface CommentFormState {
  status: "idle" | "error" | "success";
  errors: CommentErrors;
  values: Record<string, string>;
}

export const emptyCommentState: CommentFormState = { status: "idle", errors: {}, values: {} };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const read = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export const validateComment = (
  formData: FormData,
): { ok: true; data: CommentInput } | { ok: false; errors: CommentErrors } => {
  const errors: CommentErrors = {};

  const postSlug = read(formData, "postSlug");
  const name = read(formData, "name");
  const email = read(formData, "email");
  const body = read(formData, "body");

  if (name.length < 2) errors.name = "Please tell us your name.";
  else if (name.length > 100) errors.name = "That name is too long.";

  if (email === "") errors.email = "An email address is required — it is never published.";
  else if (!EMAIL.test(email)) errors.email = "That does not look like an email address.";

  if (body.length < 10) errors.body = "Please write a little more.";
  else if (body.length > 3000) errors.body = "Please keep this under 3,000 characters.";

  if (postSlug === "") errors.form = "Something went wrong. Please reload and try again.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { postSlug, name, email, body } };
};

/** Hands off to the shared seam, which must moderate before publishing. */
export async function deliverComment(comment: CommentInput): Promise<void> {
  await deliverEnquiry("comment", { ...comment });
}

/**
 * Contact form shape.
 *
 * Lives here rather than beside the action because a `"use server"` module may
 * only export async functions — a constant exported from one arrives as
 * `undefined` at the import site, which is exactly how the initial form state
 * went missing and crashed the page on first render.
 */
export interface ContactFormState {
  status: "idle" | "error" | "success";
  errors: Partial<Record<"name" | "email" | "phone" | "subject" | "message" | "form", string>>;
  /** Echoed back so a rejected form keeps the visitor's typing. */
  values: Record<string, string>;
  reference?: string;
}

export const emptyContactState: ContactFormState = { status: "idle", errors: {}, values: {} };

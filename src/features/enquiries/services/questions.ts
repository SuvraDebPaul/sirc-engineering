/**
 * Product questions.
 *
 * Pre-sales technical questions are the highest-value enquiry on an instrument
 * site: someone asking whether a tester handles 11 kV is further down the
 * buying process than anyone browsing. They route to the shared enquiry seam
 * like every other form.
 *
 * State lives here rather than beside the action because a `"use server"`
 * module may only export async functions — a constant exported from one
 * arrives as `undefined` at the import site.
 */
export interface QuestionState {
  status: "idle" | "error" | "success";
  errors: Partial<Record<"question" | "email" | "form", string>>;
  values: Record<string, string>;
}

export const emptyQuestionState: QuestionState = { status: "idle", errors: {}, values: {} };

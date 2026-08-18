/**
 * Sign-in form state.
 *
 * ⚠️ **There is no authentication on this site.** No user table, no session,
 * no password hashing — the auth stack was lost when the project was rebuilt
 * and has not been restored.
 *
 * This page therefore exists as the shell that real sign-in will occupy, and
 * it is explicit with the visitor about that *before* the form rather than
 * after submitting it. Critically, the action never reads the password field:
 * accepting a credential into a function that discards it is how real
 * passwords end up in server logs.
 *
 * When auth is wired, the password moves into a proper verification call and
 * this file's warning comes out — nothing else on the page needs to change.
 */
export interface LoginState {
  status: "idle" | "unavailable";
  errors: Partial<Record<"email" | "form", string>>;
  values: { email?: string };
}

export const emptyLoginState: LoginState = { status: "idle", errors: {}, values: {} };

"use server";

import type { LoginState } from "@/lib/login";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Sign-in attempt.
 *
 * **The password is never read.** `formData.get("password")` does not appear
 * in this function and must not be added until there is a real verification
 * step to hand it to — a credential accepted into a no-op is a credential
 * leaked to the request log.
 *
 * Only the email is validated, so the visitor gets useful feedback on a typo,
 * and then the honest answer: accounts are not open yet.
 */
export async function attemptLogin(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim() : "";

  if (email === "") {
    return { status: "idle", errors: { email: "Enter your email address." }, values: {} };
  }

  if (!EMAIL.test(email)) {
    return {
      status: "idle",
      errors: { email: "That does not look like an email address." },
      values: { email },
    };
  }

  return { status: "unavailable", errors: {}, values: { email } };
}

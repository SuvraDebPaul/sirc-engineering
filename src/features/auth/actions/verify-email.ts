"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth";

import { auth } from "@/lib/db/auth";
import {
  verifyEmailSchema,
  type VerifyEmailInput,
} from "@/features/auth/schemas/verify-email.schema";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { roleRedirectPath } from "@/features/auth/services/role-redirect";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { z } from "zod";

export interface VerifyEmailResult {
  errors?: Partial<Record<"otp" | "form", string>>;
}

const OTP_ERROR_MESSAGES: Record<string, string> = {
  INVALID_OTP: "That code is incorrect. Please check it and try again.",
  OTP_EXPIRED: "That code has expired. Request a new one.",
  TOO_MANY_ATTEMPTS: "Too many incorrect attempts. Request a new code.",
};

export async function verifyEmail(
  data: VerifyEmailInput,
): Promise<VerifyEmailResult | void> {
  const result = verifyEmailSchema.safeParse(data);
  if (!result.success) {
    return {
      errors: firstFieldErrors(z.flattenError(result.error).fieldErrors),
    };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  try {
    await auth.api.verifyEmailOTP({
      body: { email: session.user.email, otp: result.data.otp },
    });
  } catch (error) {
    const code = error instanceof APIError ? error.body?.code : undefined;
    if (code && code in OTP_ERROR_MESSAGES) {
      return { errors: { otp: OTP_ERROR_MESSAGES[code] } };
    }
    return { errors: { form: logUnexpectedError("verify-email", error) } };
  }

  redirect(roleRedirectPath(session.user.role));
}

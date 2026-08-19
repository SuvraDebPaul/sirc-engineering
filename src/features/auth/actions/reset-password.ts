"use server";

import { redirect } from "next/navigation";
import { APIError } from "better-auth";

import { auth } from "@/lib/db/auth";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/features/auth/schemas/forgot-password.schema";
import { firstFieldErrors } from "@/features/auth/schemas/format-zod-errors";
import { logUnexpectedError } from "@/features/auth/services/log-unexpected-error";
import { z } from "zod";

export interface ResetPasswordResult {
  errors?: Partial<
    Record<"otp" | "password" | "confirmPassword" | "form", string>
  >;
}

const OTP_ERROR_MESSAGES: Record<string, string> = {
  INVALID_OTP: "That code is incorrect. Please check it and try again.",
  OTP_EXPIRED: "That code has expired. Request a new one.",
  TOO_MANY_ATTEMPTS: "Too many incorrect attempts. Request a new code.",
};

export async function resetPassword(
  data: ResetPasswordInput,
): Promise<ResetPasswordResult | void> {
  const result = resetPasswordSchema.safeParse(data);
  if (!result.success) {
    return {
      errors: firstFieldErrors(z.flattenError(result.error).fieldErrors),
    };
  }

  try {
    await auth.api.resetPasswordEmailOTP({
      body: {
        email: result.data.email,
        otp: result.data.otp,
        password: result.data.password,
      },
    });
  } catch (error) {
    const code = error instanceof APIError ? error.body?.code : undefined;
    if (code && code in OTP_ERROR_MESSAGES) {
      return { errors: { otp: OTP_ERROR_MESSAGES[code] } };
    }
    return { errors: { form: logUnexpectedError("reset-password", error) } };
  }

  redirect("/login?reset=success");
}

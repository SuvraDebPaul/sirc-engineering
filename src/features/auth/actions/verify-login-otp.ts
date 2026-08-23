"use server";

import { redirect } from "next/navigation";
import { APIError } from "better-auth";
import { z } from "zod";

import { auth } from "@/lib/db/auth";
import {
  verifyLoginOtpSchema,
  type VerifyLoginOtpInput,
} from "@/features/auth/schemas/login-otp.schema";
import { roleRedirectPath } from "@/features/auth/services/role-redirect";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { checkRateLimit, getClientIp, rateLimitMessage } from "@/lib/rate-limit";

export interface VerifyLoginOtpResult {
  errors?: Partial<Record<"otp" | "form", string>>;
}

const OTP_ERROR_MESSAGES: Record<string, string> = {
  INVALID_OTP: "That code is incorrect. Please check it and try again.",
  OTP_EXPIRED: "That code has expired. Request a new one.",
  TOO_MANY_ATTEMPTS: "Too many incorrect attempts. Request a new code.",
};

export async function verifyLoginOtp(
  data: VerifyLoginOtpInput,
): Promise<VerifyLoginOtpResult | void> {
  const result = verifyLoginOtpSchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  // Better Auth already tracks attempts per OTP (`TOO_MANY_ATTEMPTS` above)
  // — this adds an IP-wide guard against guessing across many *different*
  // emails from one machine, which a per-OTP counter can't see.
  const ip = await getClientIp();
  const ipLimit = checkRateLimit(`otp-verify:ip:${ip}`, 15, 10 * 60 * 1000);
  if (!ipLimit.ok) {
    return { errors: { form: rateLimitMessage(ipLimit.retryAfterSeconds!) } };
  }

  let redirectTo: string;
  try {
    const { user } = await auth.api.signInEmailOTP({ body: result.data });
    // `signInEmailOTP`'s declared return type is hardcoded in the email-otp
    // plugin's own .d.mts and doesn't merge in `user.additionalFields` the
    // way core endpoints like `signInEmail` do — `role` is genuinely on the
    // object at runtime (same User row, same field), the type just doesn't
    // know it. Falls back to the same default `betterAuth()` gives a new row.
    const role = (user as { role?: string }).role ?? "customer";
    redirectTo = roleRedirectPath(role);
  } catch (error) {
    const code = error instanceof APIError ? error.body?.code : undefined;
    if (code && code in OTP_ERROR_MESSAGES) {
      return { errors: { otp: OTP_ERROR_MESSAGES[code] } };
    }
    return { errors: { form: logUnexpectedError("verify-login-otp", error) } };
  }

  redirect(redirectTo);
}

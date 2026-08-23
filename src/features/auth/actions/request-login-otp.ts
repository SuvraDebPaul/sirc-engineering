"use server";

import { z } from "zod";

import { auth } from "@/lib/db/auth";
import {
  requestLoginOtpSchema,
  type RequestLoginOtpInput,
} from "@/features/auth/schemas/login-otp.schema";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { checkRateLimit, getClientIp, rateLimitMessage } from "@/lib/rate-limit";

export interface RequestLoginOtpResult {
  errors?: Partial<Record<"email" | "form", string>>;
}

export async function requestLoginOtp(
  data: RequestLoginOtpInput,
): Promise<RequestLoginOtpResult | void> {
  const result = requestLoginOtpSchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  // Rate-limited on both the target email and the requester's IP: the email
  // limit stops an attacker from email-bombing one victim's inbox by
  // resubmitting, and the IP limit stops the same attacker from doing that
  // to many different victims from one machine.
  const ip = await getClientIp();
  const emailLimit = checkRateLimit(`otp-request:email:${result.data.email.toLowerCase()}`, 3, 10 * 60 * 1000);
  const ipLimit = checkRateLimit(`otp-request:ip:${ip}`, 8, 10 * 60 * 1000);
  const tighter = !emailLimit.ok ? emailLimit : !ipLimit.ok ? ipLimit : null;
  if (tighter) {
    return { errors: { form: rateLimitMessage(tighter.retryAfterSeconds!) } };
  }

  // A first-time email still gets a code — verifying it creates the account,
  // so this one form is sign-in and sign-up at once (`disableSignUp` is left
  // unset). New accounts still land on the `customer` role: Better Auth's
  // `role` field has `input: false`, so nothing from this form can set it.
  try {
    await auth.api.sendVerificationOTP({
      body: { email: result.data.email, type: "sign-in" },
    });
  } catch {
    return { errors: { form: "Something went wrong. Please try again." } };
  }
}

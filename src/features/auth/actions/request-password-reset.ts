"use server";

import { z } from "zod";

import { auth } from "@/lib/db/auth";
import {
  requestResetSchema,
  type RequestResetInput,
} from "@/features/auth/schemas/forgot-password.schema";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { checkRateLimit, getClientIp, rateLimitMessage } from "@/lib/rate-limit";

export interface RequestResetResult {
  errors?: Partial<Record<"email" | "form", string>>;
}

export async function requestPasswordReset(
  data: RequestResetInput,
): Promise<RequestResetResult | void> {
  const result = requestResetSchema.safeParse(data);
  if (!result.success) {
    return {
      errors: firstFieldErrors(z.flattenError(result.error).fieldErrors),
    };
  }

  // Same email-bombing protection as the login-OTP request — see its note.
  const ip = await getClientIp();
  const emailLimit = checkRateLimit(`reset-request:email:${result.data.email.toLowerCase()}`, 3, 10 * 60 * 1000);
  const ipLimit = checkRateLimit(`reset-request:ip:${ip}`, 8, 10 * 60 * 1000);
  const tighter = !emailLimit.ok ? emailLimit : !ipLimit.ok ? ipLimit : null;
  if (tighter) {
    return { errors: { form: rateLimitMessage(tighter.retryAfterSeconds!) } };
  }

  // Always "succeeds" here regardless of whether the email is registered —
  // Better Auth itself never reveals that, and this action shouldn't either.
  try {
    await auth.api.requestPasswordResetEmailOTP({
      body: { email: result.data.email },
    });
  } catch {
    return { errors: { form: "Something went wrong. Please try again." } };
  }
}

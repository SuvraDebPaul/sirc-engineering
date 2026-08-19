"use server";

import { z } from "zod";

import { auth } from "@/lib/db/auth";
import {
  requestResetSchema,
  type RequestResetInput,
} from "@/features/auth/schemas/forgot-password.schema";
import { firstFieldErrors } from "@/features/auth/schemas/format-zod-errors";

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

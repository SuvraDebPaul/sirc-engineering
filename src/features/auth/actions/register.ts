"use server";

import { redirect } from "next/navigation";
import { APIError } from "better-auth";

import { auth } from "@/lib/db/auth";
import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/schemas/register.schema";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { roleRedirectPath } from "@/features/auth/services/role-redirect";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { z } from "zod";
import { checkRateLimit, getClientIp, rateLimitMessage } from "@/lib/rate-limit";

export interface RegisterResult {
  errors?: Partial<
    Record<"name" | "email" | "password" | "confirmPassword" | "form", string>
  >;
}

export async function register(
  data: RegisterInput,
): Promise<RegisterResult | void> {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return {
      errors: firstFieldErrors(z.flattenError(result.error).fieldErrors),
    };
  }

  // Five new accounts per hour per IP — stops scripted account creation
  // without meaningfully limiting a real household or office signing up.
  const ip = await getClientIp();
  const limit = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return { errors: { form: rateLimitMessage(limit.retryAfterSeconds!) } };
  }

  let redirectTo: string;
  try {
    const { user } = await auth.api.signUpEmail({
      body: {
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      },
    });
    redirectTo = user.emailVerified
      ? roleRedirectPath(user.role)
      : "/verify-email";
  } catch (error) {
    if (
      error instanceof APIError &&
      error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
    ) {
      return {
        errors: { email: "An account with this email already exists." },
      };
    }
    return { errors: { form: logUnexpectedError("register", error) } };
  }

  redirect(redirectTo);
}

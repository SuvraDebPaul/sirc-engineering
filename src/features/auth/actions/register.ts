"use server";

import { auth } from "@/lib/db/auth";
import { RegisterInput, registerSchema } from "../schemas/register.schema";
import { firstFieldErrors } from "@/features/auth/schemas/format-zod-errors";
import { redirect } from "next/navigation";
import { roleRedirectPath } from "../services/role-redirect";
import { APIError } from "better-auth";
import { z } from "zod";

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
  try {
    const { user } = await auth.api.signUpEmail({
      body: {
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      },
    });
    redirect(roleRedirectPath(user.role));
  } catch (error) {
    if (error instanceof APIError) {
      return { errors: { form: "Something went wrong. Please try again" } };
    }
    throw error;
  }
}

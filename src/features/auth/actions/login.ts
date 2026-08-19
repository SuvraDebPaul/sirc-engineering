"use server";
import { auth } from "@/lib/db/auth";
import { LoginInput, loginSchema } from "../schemas/login.schema";
import { firstFieldErrors } from "@/features/auth/schemas/format-zod-errors";
import { redirect } from "next/navigation";
import { roleRedirectPath } from "../services/role-redirect";
import { APIError } from "better-auth";
import { z } from "zod";
import { logUnexpectedError } from "../services/log-unexpected-error";

export interface LoginResult {
  errors?: Partial<Record<"email" | "password" | "form", string>>;
}

export async function login(data: LoginInput): Promise<LoginResult | void> {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return {
      errors: firstFieldErrors(z.flattenError(result.error).fieldErrors),
    };
  }

  let redirectTo: string;
  try {
    const { user } = await auth.api.signInEmail({ body: result.data });
    redirectTo = roleRedirectPath(user.role);
  } catch (error) {
    if (error instanceof APIError) {
      return { errors: { form: "Incorrect email or password." } };
    }
    return { errors: { form: logUnexpectedError("login", error) } };
  }

  redirect(redirectTo);
}

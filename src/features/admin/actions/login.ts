"use server";

import { redirect } from "next/navigation";

import { auth } from "@/lib/db/auth";

export interface LoginState {
  error?: string;
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    await auth.api.signInEmail({ body: { email, password } });
  } catch {
    // Better Auth throws on any failure — wrong password, unknown email.
    // One message for both: telling an attacker which part was wrong is a
    // real information leak on an admin login.
    return { error: "Incorrect email or password." };
  }

  redirect("/admin");
}

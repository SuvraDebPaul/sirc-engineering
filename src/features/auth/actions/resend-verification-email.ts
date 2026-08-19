"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/db/auth";

export async function resendVerificationEmail(): Promise<{
  error?: string;
} | void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  try {
    await auth.api.sendVerificationOTP({
      body: { email: session.user.email, type: "email-verification" },
    });
  } catch {
    return { error: "Could not resend the code. Please try again shortly." };
  }
}

"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/db/auth";
import { checkRateLimit, rateLimitMessage } from "@/lib/rate-limit";

export async function resendVerificationEmail(): Promise<{
  error?: string;
} | void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Already gated behind a session, so this is just a "stop mashing resend"
  // limit rather than an anti-abuse one.
  const limit = checkRateLimit(`resend-verification:${session.user.id}`, 3, 10 * 60 * 1000);
  if (!limit.ok) {
    return { error: rateLimitMessage(limit.retryAfterSeconds!) };
  }

  try {
    await auth.api.sendVerificationOTP({
      body: { email: session.user.email, type: "email-verification" },
    });
  } catch {
    return { error: "Could not resend the code. Please try again shortly." };
  }
}

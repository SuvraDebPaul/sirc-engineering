import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/lib/db/prisma";

/**
 * Admin authentication.
 *
 * There is no public sign-up anywhere in the UI, and `disableSignUp` blocks
 * the sign-up endpoint itself — not just the button. This table is for staff
 * only; customers never sign in, since pricing is public and quotations need
 * no account. The one admin account was created by `scripts/seed-admin.ts`.
 *
 * `nextCookies()` must be the last plugin in this array — it hooks Better
 * Auth's cookie-setting to Next's `cookies()` API whenever it runs inside a
 * Server Action or Route Handler.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [nextCookies()],
});

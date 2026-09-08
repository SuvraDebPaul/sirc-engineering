import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db/prisma";
import { emailOTP } from "better-auth/plugins/email-otp";
import { sendEmail } from "@/lib/email";
import { otpEmailContent } from "@/features/auth/services/otp-emails";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    /**
     * Without this, every `getSession()` is two database queries — the
     * session row and then the user row — on every request to every page,
     * for every signed-in visitor. The cookie cache keeps a signed copy of
     * the session in the cookie itself and only re-reads the database when
     * it expires, which takes the common case to zero queries.
     *
     * Five minutes is the trade: a role change or a sign-out elsewhere takes
     * up to that long to be noticed. Better Auth refreshes the cookie on
     * sign-in and sign-out directly, so the window only matters for changes
     * made out of band (an admin promoting someone in the dashboard).
     */
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false,
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 5, //5 Minute
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        const { subject, html } = otpEmailContent(type, otp);
        await sendEmail({ to: email, subject, html });
      },
    }),
    nextCookies(),
  ],
});

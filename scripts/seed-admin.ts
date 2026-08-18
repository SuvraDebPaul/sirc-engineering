import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";

import { prisma } from "@/lib/prisma";

/**
 * Creates the one admin account.
 *
 * `disableSignUp` blocks Better Auth's own sign-up handler everywhere,
 * including when called programmatically — the guard sits inside the shared
 * handler, not just the HTTP route. So this writes the User and Account rows
 * directly, using Better Auth's own password hasher (`better-auth/crypto`)
 * so the stored hash verifies correctly against a normal sign-in afterward.
 *
 * Safe to re-run: if the email already exists, it exits without creating a
 * duplicate.
 */
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running this script.",
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD should be at least 8 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email} — nothing to do.`);
    return;
  }

  const userId = randomUUID();
  const hash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.create({
      data: { id: userId, name, email, emailVerified: true, role: "admin" },
    }),
    prisma.account.create({
      data: {
        id: randomUUID(),
        userId,
        accountId: userId,
        providerId: "credential",
        password: hash,
      },
    }),
  ]);

  console.log(`✅ Admin account created: ${email}`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

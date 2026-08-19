import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import { auth } from "@/lib/db/auth";
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";
import { roleRedirectPath } from "@/features/auth/services/role-redirect";

export const metadata: Metadata = {
  title: "Verify your email",
};

export default async function VerifyEmailPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const skipTo = roleRedirectPath(session.user.role);
  if (session.user.emailVerified) redirect(skipTo);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight">
          Verify your email
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a code to {session.user.email}.
        </p>
        <div className="mt-6">
          <VerifyEmailForm />
        </div>
        <p className="mt-4 text-center text-sm">
          <Link
            href={skipTo}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            Skip for now
          </Link>
        </p>
      </div>
    </div>
  );
}

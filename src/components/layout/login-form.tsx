"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Info, LogIn } from "lucide-react";

import { attemptLogin } from "@/app/(public)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contactInfo } from "@/config/site";
import { emptyLoginState } from "@/lib/login";

/**
 * Sign-in form.
 *
 * The notice sits **above** the form, not behind the submit button, so nobody
 * types a password before learning that accounts are not open. The password
 * input is present because this is the shell real sign-in will occupy — but
 * the action never reads it, and `autoComplete="new-password"` stops browsers
 * offering a saved credential for a form that cannot use one.
 */
export function LoginForm() {
  const [state, formAction, isPending] = useActionState(attemptLogin, emptyLoginState);

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
        <Info className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Accounts are not open yet.</span> You do not
          need one — prices are public and quotations need no login. This page is here for the
          account area we are building.
        </p>
      </div>

      <form action={formAction} noValidate className="rounded-2xl border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          For trade account holders and staff.
        </p>

        {state.status === "unavailable" && (
          <div role="status" className="mt-5 rounded-xl border bg-muted/50 p-4 text-sm">
            <p className="font-medium">Accounts are not enabled yet</p>
            <p className="mt-1 text-muted-foreground">
              Nothing was submitted. If you have a trade account with us, call{" "}
              <a href={`tel:${contactInfo.phone}`} className="font-medium text-primary hover:underline">
                {contactInfo.phone}
              </a>{" "}
              and we will help directly.
            </p>
          </div>
        )}

        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email address</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.values.email}
              aria-invalid={state.errors.email ? true : undefined}
              aria-describedby={state.errors.email ? "login-email-error" : undefined}
            />
            {state.errors.email && (
              <p id="login-email-error" className="text-sm text-destructive">
                {state.errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              // Not `current-password`: there is nothing to authenticate against,
              // so offering a saved credential here would be misleading.
              autoComplete="new-password"
            />
          </div>
        </div>

        <Button type="submit" size="lg" disabled={isPending} className="mt-6 h-11 w-full">
          <LogIn className="size-4" aria-hidden="true" />
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Looking to buy or get a price?{" "}
        <Link href="/rfq" className="font-medium text-primary hover:underline">
          Request a quotation
        </Link>{" "}
        — no account needed.
      </p>
    </div>
  );
}

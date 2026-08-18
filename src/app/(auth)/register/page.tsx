import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight">
          Create an account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track orders and save your details.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

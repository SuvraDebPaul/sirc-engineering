import type { Metadata } from "next";

import { LoginForm } from "@/features/admin/components/login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">SIRC admin panel.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

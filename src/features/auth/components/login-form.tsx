"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

import {
  loginSchema,
  type LoginInput,
} from "@/features/auth/schemas/login.schema";
import { login } from "@/features/auth/actions/login";
import { signInWithGoogle } from "@/features/auth/actions/sign-in-google";
import { LoginOtpForm } from "@/features/auth/components/login-otp-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

/**
 * Switches between the password form and the one-time-code form.
 *
 * Kept as a plain mode switch with no hooks of its own — each mode is its
 * own component with its own hooks, so switching never skips a hook call
 * partway through a render (a component that returns early *between* two
 * hook calls breaks React's fixed hook order for that render).
 */
export function LoginForm() {
  const [mode, setMode] = useState<"password" | "otp">("password");

  if (mode === "otp") {
    return <LoginOtpForm onUsePassword={() => setMode("password")} />;
  }

  return <PasswordLoginForm onUseOtp={() => setMode("otp")} />;
}

function PasswordLoginForm({ onUseOtp }: { onUseOtp: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await login(data);
    if (result?.errors) {
      for (const [field, message] of Object.entries(result.errors)) {
        setError(field === "form" ? "root" : (field as keyof LoginInput), {
          message,
        });
      }
    }
  });

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {errors.root && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            {errors.root.message}
          </div>
        )}

        <FormField
          name="email"
          label="Email"
          required
          error={errors.email?.message}
        >
          {(props) => (
            <Input
              {...props}
              type="email"
              autoComplete="email"
              {...registerField("email")}
            />
          )}
        </FormField>

        <FormField
          name="password"
          label="Password"
          required
          error={errors.password?.message}
        >
          {(props) => (
            <div className="relative">
              <Input
                {...props}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-10"
                {...registerField("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </FormField>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...registerField("rememberMe")}
            className="size-4 rounded border-input accent-primary"
          />
          Remember me
        </label>

        <div className="text-right text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative py-2 text-center text-xs text-muted-foreground">
        <span className="relative bg-card px-2">or</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 border-t" />
      </div>

      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" size="lg" className="w-full">
          Continue with Google
        </Button>
      </form>

      <button
        type="button"
        onClick={onUseOtp}
        className="w-full text-center text-sm font-medium text-primary hover:underline"
      >
        Sign in with a one-time code instead
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

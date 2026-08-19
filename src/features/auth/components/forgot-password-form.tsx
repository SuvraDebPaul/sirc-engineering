"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import {
  requestResetSchema,
  resetPasswordSchema,
  type RequestResetInput,
  type ResetPasswordInput,
} from "@/features/auth/schemas/forgot-password.schema";
import { requestPasswordReset } from "@/features/auth/actions/request-password-reset";
import { resetPassword } from "@/features/auth/actions/reset-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");

  if (step === "reset") {
    return <ResetStep email={email} onBack={() => setStep("request")} />;
  }

  return (
    <RequestStep
      onSent={(sentEmail) => {
        setEmail(sentEmail);
        setStep("reset");
      }}
    />
  );
}

function RequestStep({ onSent }: { onSent: (email: string) => void }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RequestResetInput>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await requestPasswordReset(data);
    if (result?.errors) {
      for (const [field, message] of Object.entries(result.errors)) {
        setError(
          field === "form" ? "root" : (field as keyof RequestResetInput),
          { message },
        );
      }
      return;
    }
    onSent(data.email);
  });

  return (
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

      <p className="text-sm text-muted-foreground">
        Enter the email on your account and we&apos;ll send you a code to reset
        your password.
      </p>

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
            {...register("email")}
          />
        )}
      </FormField>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {isSubmitting ? "Sending…" : "Send code"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

function ResetStep({ email, onBack }: { email: string; onBack: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email, otp: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await resetPassword(data);
    if (result?.errors) {
      for (const [field, message] of Object.entries(result.errors)) {
        setError(
          field === "form" ? "root" : (field as keyof ResetPasswordInput),
          { message },
        );
      }
    }
    // On success resetPassword() redirects — nothing left to do here.
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Carries the email across without putting it in the URL. */}
      <input type="hidden" {...register("email")} />

      <div
        role="status"
        className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700"
      >
        <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
        We sent a code to {email}.
      </div>

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
        name="otp"
        label="Verification code"
        required
        error={errors.otp?.message}
      >
        {(props) => (
          <Input
            {...props}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            {...register("otp")}
          />
        )}
      </FormField>

      <FormField
        name="password"
        label="New password"
        required
        error={errors.password?.message}
      >
        {(props) => (
          <div className="relative">
            <Input
              {...props}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="pr-10"
              {...register("password")}
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

      <FormField
        name="confirmPassword"
        label="Confirm new password"
        required
        error={errors.confirmPassword?.message}
      >
        {(props) => (
          <div className="relative">
            <Input
              {...props}
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              className="pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </FormField>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {isSubmitting ? "Resetting…" : "Reset password"}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        Use a different email
      </button>
    </form>
  );
}

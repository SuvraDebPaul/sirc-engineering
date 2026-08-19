"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import {
  verifyEmailSchema,
  type VerifyEmailInput,
} from "@/features/auth/schemas/verify-email.schema";
import { verifyEmail } from "@/features/auth/actions/verify-email";
import { resendVerificationEmail } from "@/features/auth/actions/resend-verification-email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function VerifyEmailForm() {
  const [isResending, startResend] = useTransition();
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { otp: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await verifyEmail(data);
    if (result?.errors) {
      for (const [field, message] of Object.entries(result.errors)) {
        setError(
          field === "form" ? "root" : (field as keyof VerifyEmailInput),
          { message },
        );
      }
    }
  });

  const handleResend = () => {
    setResendMessage(null);
    startResend(async () => {
      const result = await resendVerificationEmail();
      setResendMessage(result?.error ?? "A new code is on its way.");
    });
  };

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

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {isSubmitting ? "Verifying…" : "Verify email"}
      </Button>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="font-medium text-primary hover:underline disabled:opacity-50"
        >
          {isResending ? "Sending…" : "Resend code"}
        </button>
      </div>

      {resendMessage && (
        <p
          role="status"
          className="flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground"
        >
          <CheckCircle2
            className="size-3.5 shrink-0 text-emerald-500"
            aria-hidden="true"
          />
          {resendMessage}
        </p>
      )}
    </form>
  );
}

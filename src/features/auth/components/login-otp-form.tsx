"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import {
  requestLoginOtpSchema,
  verifyLoginOtpSchema,
  type RequestLoginOtpInput,
  type VerifyLoginOtpInput,
} from "@/features/auth/schemas/login-otp.schema";
import { requestLoginOtp } from "@/features/auth/actions/request-login-otp";
import { verifyLoginOtp } from "@/features/auth/actions/verify-login-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

/**
 * Sign in with a one-time code — no password to remember, and no SMS
 * provider needed since it rides the same `emailOTP` plugin already wired
 * for verification and password reset.
 *
 * A first-time email is a first-time *account*: `signInEmailOTP` creates the
 * user on a valid code, so this form doubles as sign-up. That's a deliberate
 * choice, not a side effect — the role still can't be set from here.
 */
export function LoginOtpForm({ onUsePassword }: { onUsePassword: () => void }) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");

  if (step === "verify") {
    return <VerifyStep email={email} onBack={() => setStep("request")} />;
  }

  return (
    <RequestStep
      onSent={(sentEmail) => {
        setEmail(sentEmail);
        setStep("verify");
      }}
      onUsePassword={onUsePassword}
    />
  );
}

function RequestStep({
  onSent,
  onUsePassword,
}: {
  onSent: (email: string) => void;
  onUsePassword: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RequestLoginOtpInput>({
    resolver: zodResolver(requestLoginOtpSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await requestLoginOtp(data);
    if (result?.errors) {
      for (const [field, message] of Object.entries(result.errors)) {
        setError(field === "form" ? "root" : (field as keyof RequestLoginOtpInput), { message });
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
        Enter your email and we&apos;ll send you a one-time code to sign in.
      </p>

      <FormField name="email" label="Email" required error={errors.email?.message}>
        {(props) => <Input {...props} type="email" autoComplete="email" {...register("email")} />}
      </FormField>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {isSubmitting ? "Sending…" : "Send code"}
      </Button>

      <button
        type="button"
        onClick={onUsePassword}
        className="w-full text-center text-sm font-medium text-primary hover:underline"
      >
        Sign in with a password instead
      </button>
    </form>
  );
}

function VerifyStep({ email, onBack }: { email: string; onBack: () => void }) {
  const [isResending, startResend] = useTransition();
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyLoginOtpInput>({
    resolver: zodResolver(verifyLoginOtpSchema),
    defaultValues: { email, otp: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await verifyLoginOtp(data);
    if (result?.errors) {
      for (const [field, message] of Object.entries(result.errors)) {
        setError(field === "form" ? "root" : (field as keyof VerifyLoginOtpInput), { message });
      }
    }
    // On success verifyLoginOtp() redirects — nothing left to do here.
  });

  const handleResend = () => {
    setResendMessage(null);
    startResend(async () => {
      const result = await requestLoginOtp({ email });
      setResendMessage(result?.errors?.form ?? "A new code is on its way.");
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
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

      <FormField name="otp" label="Verification code" required error={errors.otp?.message}>
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

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          Use a different email
        </button>
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
        <p role="status" className="flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
          <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
          {resendMessage}
        </p>
      )}
    </form>
  );
}

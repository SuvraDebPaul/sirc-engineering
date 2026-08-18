"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";

import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/schemas/register.schema";
import { register as registerAction } from "@/features/auth/actions/register";
import { signInWithGoogle } from "@/features/auth/actions/sign-in-google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

export function RegisterForm() {
  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await registerAction(data);
    if (result?.errors) {
      for (const [field, message] of Object.entries(result.errors)) {
        setError(field === "form" ? "root" : (field as keyof RegisterInput), {
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
          name="name"
          label="Name"
          required
          error={errors.name?.message}
        >
          {(props) => (
            <Input {...props} autoComplete="name" {...registerField("name")} />
          )}
        </FormField>

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
            <Input
              {...props}
              type="password"
              autoComplete="new-password"
              {...registerField("password")}
            />
          )}
        </FormField>

        <FormField
          name="confirmPassword"
          label="Confirm password"
          required
          error={errors.confirmPassword?.message}
        >
          {(props) => (
            <Input
              {...props}
              type="password"
              autoComplete="new-password"
              {...registerField("confirmPassword")}
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
          {isSubmitting ? "Creating account…" : "Create account"}
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

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

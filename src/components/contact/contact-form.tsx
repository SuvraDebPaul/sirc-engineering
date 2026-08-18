"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

import { submitContact } from "@/app/(public)/contact/actions";
import { emptyContactState } from "@/lib/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { contactInfo } from "@/config/site";

/**
 * "Get in touch with us" — the panel beside the map in the reference design.
 *
 * Same construction as the other two forms on the site: a Server Action so it
 * posts without JavaScript, server-side validation, values echoed back on
 * failure, and an error summary that takes focus on every failed attempt.
 */
export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, emptyContactState);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-muted/40 p-8 text-center sm:p-12">
        <CheckCircle2 className="size-14 text-emerald-500" strokeWidth={1.5} aria-hidden="true" />

        <h2 className="mt-5 text-xl font-semibold tracking-tight">Message sent</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Your reference is{" "}
          <span className="font-mono font-semibold text-foreground">{state.reference}</span>. We
          reply within one working day.
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          Need us sooner? Call{" "}
          <a href={`tel:${contactInfo.phone}`} className="font-medium text-primary hover:underline">
            {contactInfo.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  const { errors, values } = state;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form action={formAction} noValidate className="rounded-2xl bg-muted/40 p-6 sm:p-8">
      <h2 className="text-xl font-bold uppercase tracking-tight">Get in touch with us</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        If you wish to reach us directly, please fill out the form below.
      </p>

      {hasErrors && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mt-5 flex gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
          <p className="font-medium text-destructive">
            {errors.form ?? "Please check the highlighted fields."}
          </p>
        </div>
      )}

      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="mt-6 space-y-5">
        <FormField idPrefix="contact" name="name" label="Your name" required error={errors.name}>
          {(props) => (
            <Input
              {...props}
              autoComplete="name"
              defaultValue={values.name}
            />
          )}
        </FormField>

        <FormField idPrefix="contact" name="email" label="Your email" required error={errors.email}>
          {(props) => (
            <Input
              {...props}
              type="email"
              autoComplete="email"
              defaultValue={values.email}
            />
          )}
        </FormField>

        <FormField idPrefix="contact" name="phone" label="Your phone (optional)" error={errors.phone}>
          {(props) => (
            <Input
              {...props}
              type="tel"
              autoComplete="tel"
              defaultValue={values.phone}
            />
          )}
        </FormField>

        <FormField idPrefix="contact" name="subject" label="Subject (optional)" error={errors.subject}>
          {(props) => (
            <Input
              {...props}
              defaultValue={values.subject}
            />
          )}
        </FormField>

        <FormField idPrefix="contact" name="message" label="Your message" required error={errors.message}>
          {(props) => (
            <Textarea
              {...props}
              rows={7}
              defaultValue={values.message}
            />
          )}
        </FormField>
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="mt-6 h-12 px-8">
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {isPending ? "Sending…" : "Submit"}
      </Button>
    </form>
  );
}


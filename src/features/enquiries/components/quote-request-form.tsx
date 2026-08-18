"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";

import { submitQuoteRequest } from "@/features/enquiries/actions/submit-rfq";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ENQUIRY_TYPES, emptyFormState } from "@/features/enquiries/services/rfq";

/**
 * Quotation request form.
 *
 * Plain form fields wired to a Server Action. There is no client validation
 * library and no controlled state — the browser's own `required` and `type`
 * attributes give instant feedback, the server decides what is actually valid,
 * and the two do not have to be kept in step.
 *
 * `useActionState` is the only client-side machinery, and it is a progressive
 * upgrade: without JavaScript the browser posts the form and renders the
 * response, which is why the enquiry type is a native `<select>` rather than
 * the Radix one used elsewhere on the site.
 *
 * Errors are reported twice on purpose — a summary at the top that takes focus,
 * and a message beside each field. The summary is what makes a long form
 * usable on a phone, where the offending field is often off screen.
 */
export function QuoteRequestForm({
  defaultSku = "",
  defaultEnquiryType = "purchase",
  phone,
}: {
  defaultSku?: string;
  defaultEnquiryType?: string;
  phone: string;
}) {
  const [state, formAction, isPending] = useActionState(submitQuoteRequest, emptyFormState);
  const summaryRef = useRef<HTMLDivElement>(null);

  // Keyed on the whole result object, which is a new reference after every
  // submission. `autoFocus` would only fire the first time the summary
  // mounted, leaving a second failed attempt with focus stranded on the
  // button — the exact moment the visitor most needs telling what went wrong.
  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center sm:p-12">
        <CheckCircle2
          className="mx-auto size-14 text-emerald-500"
          strokeWidth={1.5}
          aria-hidden="true"
        />

        <h2 className="mt-5 text-xl font-semibold tracking-tight">Request received</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Your reference is{" "}
          <span className="font-mono font-semibold text-foreground">{state.reference}</span>. An
          engineer will come back to you within one working day with a written quotation.
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          Need it sooner? Call{" "}
          <a href={`tel:${phone}`} className="font-medium text-primary hover:underline">
            {phone}
          </a>{" "}
          and quote your reference.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/products">Continue browsing</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const errors = state.errors;
  const values = state.values;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form action={formAction} noValidate className="rounded-2xl border bg-card p-6 sm:p-8">
      {hasErrors && (
        <div
          // Focused by the effect above, so submitting a bad form lands the
          // reader on the explanation rather than leaving them at the button
          // wondering why nothing happened.
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 flex gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
          <div className="min-w-0 text-sm">
            <p className="font-medium text-destructive">
              {errors.form ?? "Please check the highlighted fields."}
            </p>
            {!errors.form && (
              <ul className="mt-1.5 list-inside list-disc text-muted-foreground">
                {Object.entries(errors).map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Honeypot: off-screen rather than display:none, which some bots skip.
          aria-hidden and tabIndex keep it away from real users entirely. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          className="sm:col-span-2"
          name="enquiryType"
          label="What is this about?"
          required
          error={errors.enquiryType}
        >
          {(props) => (
            <select
              {...props}
              defaultValue={values.enquiryType ?? defaultEnquiryType}
              className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm dark:bg-input/30"
            >
              {ENQUIRY_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <FormField name="name" label="Your name" required error={errors.name}>
          {(props) => (
            <Input {...props} autoComplete="name" defaultValue={values.name} placeholder="Rahim Uddin" />
          )}
        </FormField>

        <FormField name="company" label="Company" hint="Optional" error={errors.company}>
          {(props) => (
            <Input
              {...props}
              autoComplete="organization"
              defaultValue={values.company}
              placeholder="Acme Textiles Ltd."
            />
          )}
        </FormField>

        <FormField name="department" label="Department" hint="Optional" error={errors.department}>
          {(props) => (
            <Input {...props} defaultValue={values.department} placeholder="Maintenance" />
          )}
        </FormField>

        <FormField name="designation" label="Designation" hint="Optional" error={errors.designation}>
          {(props) => (
            <Input
              {...props}
              autoComplete="organization-title"
              defaultValue={values.designation}
              placeholder="Plant Engineer"
            />
          )}
        </FormField>

        <FormField name="email" label="Email" required error={errors.email}>
          {(props) => (
            <Input
              {...props}
              type="email"
              inputMode="email"
              autoComplete="email"
              defaultValue={values.email}
              placeholder="you@company.com"
            />
          )}
        </FormField>

        <FormField name="phone" label="Phone" required error={errors.phone}>
          {(props) => (
            <Input
              {...props}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              defaultValue={values.phone}
              placeholder="+880 1XXX XXXXXX"
            />
          )}
        </FormField>

        <FormField
          name="sku"
          label="Model or part number"
          hint="Optional"
          error={errors.sku}
        >
          {(props) => (
            <Input {...props} defaultValue={values.sku ?? defaultSku} placeholder="MIT525" />
          )}
        </FormField>

        <FormField name="quantity" label="Quantity" hint="Optional" error={errors.quantity}>
          {(props) => (
            <Input
              {...props}
              type="number"
              min={1}
              max={9999}
              inputMode="numeric"
              defaultValue={values.quantity ?? "1"}
            />
          )}
        </FormField>

        <FormField
          className="sm:col-span-2"
          name="message"
          label="What do you need?"
          hint="Ranges, accuracy class, certificate requirements, site conditions — whatever you have."
          required
          error={errors.message}
        >
          {(props) => (
            <Textarea
              {...props}
              rows={6}
              defaultValue={values.message}
              placeholder="We need three 5 kV insulation testers for a substation shutdown in November, with calibration certificates valid for 12 months."
            />
          )}
        </FormField>
      </div>

      <div className="mt-6">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-input accent-primary"
          />
          <span className="text-muted-foreground">
            I agree to SIRC contacting me about this request. We will not pass your details to
            anyone else.
          </span>
        </label>

        {errors.consent && (
          <p id="consent-error" className="mt-1.5 text-sm text-destructive">
            {errors.consent}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="mt-7 h-12 w-full text-base">
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        {isPending ? "Sending…" : "Send request"}
      </Button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        No account needed. We reply within one working day.
      </p>
    </form>
  );
}


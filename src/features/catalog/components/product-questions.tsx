"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, HelpCircle, Loader2, Send } from "lucide-react";

import { askProductQuestion } from "@/features/enquiries/actions/ask-product-question";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { emptyQuestionState } from "@/features/enquiries/services/questions";

/**
 * Ask a question about this product.
 *
 * Technical pre-sales questions are the largest friction in instrument
 * buying — "will this work on 11 kV?", "does it come with the clamp?" — and
 * every one that goes unanswered is a lost order. Answering them publicly also
 * builds the long-tail search surface that model numbers alone never reach.
 *
 * No questions are displayed, because none have been asked and none are
 * invented. When answered questions exist they belong above this form; the
 * empty state says so plainly rather than implying an active community.
 *
 * The answer route is deliberately two-track: the form for anything that needs
 * a considered reply, WhatsApp for anything that needs one now.
 */
export function ProductQuestions({
  productName,
  model,
}: {
  productName: string;
  model: string;
}) {
  const [state, formAction, isPending] = useActionState(askProductQuestion, emptyQuestionState);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
  }, [state]);

  return (
    <section aria-labelledby="questions" className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 id="questions" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <HelpCircle className="size-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
          Questions about this instrument
        </h2>

        <p className="mt-3 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          No questions have been asked about this instrument yet. Ask one and an applications
          engineer will answer — we publish the answers here, so the next person with the same
          question finds it.
        </p>

        <div className="mt-5">
          <p className="text-sm font-medium">Need an answer today?</p>
          <WhatsAppButton
            className="mt-3"
            label="Ask on WhatsApp"
            message={`Hello, I have a question about the ${productName} (${model}).`}
          />
        </div>
      </div>

      {state.status === "success" ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center">
          <CheckCircle2 className="size-12 text-emerald-500" strokeWidth={1.5} aria-hidden="true" />
          <h3 className="mt-4 font-semibold">Question received</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            An engineer will reply by email, usually within one working day. If it is useful to
            others we will publish the answer on this page.
          </p>
        </div>
      ) : (
        <form action={formAction} noValidate className="rounded-2xl border bg-card p-6">
          <input type="hidden" name="model" value={model} />

          <h3 className="font-semibold">Ask a question</h3>

          {Object.keys(state.errors).length > 0 && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              className="mt-4 flex gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <p className="font-medium text-destructive">
                {state.errors.form ?? "Please check the highlighted fields."}
              </p>
            </div>
          )}

          <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
            <label htmlFor="question-website">Leave this field empty</label>
            <input id="question-website" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-body">Your question</Label>
              <Textarea
                id="question-body"
                name="question"
                rows={4}
                required
                defaultValue={state.values.question}
                placeholder="Will this work on an 11 kV cable? What is supplied in the case?"
                aria-invalid={state.errors.question ? true : undefined}
              />
              {state.errors.question && (
                <p className="text-sm text-destructive">{state.errors.question}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-email">Email for the answer</Label>
              <Input
                id="question-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue={state.values.email}
                aria-invalid={state.errors.email ? true : undefined}
              />
              {state.errors.email && (
                <p className="text-sm text-destructive">{state.errors.email}</p>
              )}
            </div>
          </div>

          <Button type="submit" size="lg" disabled={isPending} className="mt-5 w-full">
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
            {isPending ? "Sending…" : "Send question"}
          </Button>

          <p className="mt-3 text-xs text-muted-foreground">
            Your email is used only to reply and is never published.
          </p>
        </form>
      )}
    </section>
  );
}

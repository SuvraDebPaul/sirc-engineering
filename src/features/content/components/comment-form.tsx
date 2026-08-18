"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Loader2, MessageSquare } from "lucide-react";

import { submitComment } from "@/features/enquiries/actions/submit-comment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { emptyCommentState } from "@/features/enquiries/services/comments";

/**
 * "Leave a reply" — the comment form from the reference design.
 *
 * Comments are held for moderation and the success message says so, because
 * nothing here publishes anything: the action logs and discards until a
 * destination is wired. Telling someone their comment is live when it is not
 * would be the worst possible outcome of this form.
 *
 * Same construction as the quotation form — server-validated, values echoed
 * back on failure, error summary takes focus on every failed attempt rather
 * than only the first.
 */
export function CommentForm({ postSlug }: { postSlug: string }) {
  const [state, formAction, isPending] = useActionState(submitComment, emptyCommentState);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error") summaryRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="mt-4 text-lg font-semibold">Thank you</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your comment has been sent for moderation. It will appear once an editor has reviewed it.
        </p>
      </div>
    );
  }

  const { errors, values } = state;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form action={formAction} noValidate className="rounded-2xl border bg-card p-6 sm:p-8">
      <input type="hidden" name="postSlug" value={postSlug} />

      <h3 className="text-lg font-semibold tracking-tight">Leave a reply</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Your email address will not be published. Comments are moderated before they appear.
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
        <label htmlFor="comment-website">Leave this field empty</label>
        <input id="comment-website" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="mt-6 space-y-2">
        <Label htmlFor="comment-body">
          Comment
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        </Label>
        <Textarea
          id="comment-body"
          name="body"
          rows={6}
          required
          defaultValue={values.body}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? "comment-body-error" : undefined}
        />
        {errors.body && (
          <p id="comment-body-error" className="text-sm text-destructive">
            {errors.body}
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="comment-name">
            Name
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="comment-name"
            name="name"
            required
            autoComplete="name"
            defaultValue={values.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "comment-name-error" : undefined}
          />
          {errors.name && (
            <p id="comment-name-error" className="text-sm text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="comment-email">
            Email
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="comment-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={values.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "comment-email-error" : undefined}
          />
          {errors.email && (
            <p id="comment-email-error" className="text-sm text-destructive">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="mt-6">
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <MessageSquare className="size-4" aria-hidden="true" />
        )}
        {isPending ? "Posting…" : "Post comment"}
      </Button>
    </form>
  );
}

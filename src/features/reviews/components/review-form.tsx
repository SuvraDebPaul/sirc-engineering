"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";

import {
  reviewSchema,
  type ReviewFormValues,
  type ReviewInput,
} from "@/features/reviews/schemas/review.schema";
import { submitReviewAction } from "@/features/reviews/actions/submit-review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

/**
 * The star-rating input. A clickable version of `StarRating` — kept separate
 * because the display component is deliberately server-only (no JS shipped),
 * and this one has to be a client island to handle clicks.
 */
function RatingInput({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (next: number) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <span id="review-rating-label" className="text-sm font-medium">
        Your rating<span className="text-destructive" aria-hidden="true"> *</span>
      </span>
      <div
        role="radiogroup"
        aria-labelledby="review-rating-label"
        className="flex gap-1"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange(star)}
            className="p-0.5"
          >
            <Star
              className={cn(
                "size-7 transition-colors",
                star <= value ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/40",
              )}
              strokeWidth={1}
            />
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function ReviewForm({
  productId,
  productSlug,
  existingReview,
}: {
  productId: string;
  productSlug: string;
  existingReview: { rating: number; title: string; body: string } | null;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues, unknown, ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      title: existingReview?.title ?? "",
      body: existingReview?.body ?? "",
    },
  });

  const rating = useWatch({ control, name: "rating" });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);
    const result = await submitReviewAction(productId, productSlug, data);

    if (result.success) {
      setSubmitted(true);
      router.refresh();
      return;
    }

    const { form, ...fieldErrors } = result.errors ?? {};
    if (form) setFormError(form);
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (message) setError(field as keyof ReviewInput, { message });
    }
  });

  if (submitted) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
        Thanks — your review has been posted.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-2xl border p-6">
      <h3 className="font-semibold">{existingReview ? "Edit your review" : "Write a review"}</h3>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <RatingInput
        value={Number(rating) || 0}
        onChange={(next) => setValue("rating", next, { shouldValidate: true })}
        error={errors.rating?.message}
      />

      <FormField name="title" label="Title" required error={errors.title?.message}>
        {(props) => (
          <Input {...props} placeholder="Sum up your experience" {...register("title")} />
        )}
      </FormField>

      <FormField name="body" label="Review" required error={errors.body?.message}>
        {(props) => (
          <Textarea
            {...props}
            rows={4}
            placeholder="What did you use this for, and how did it perform?"
            {...register("body")}
          />
        )}
      </FormField>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {existingReview ? "Update review" : "Post review"}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";

import {
  testimonialSchema,
  type TestimonialFormValues,
  type TestimonialInput,
} from "@/features/content/schemas/testimonial.schema";
import { createTestimonialAction } from "@/features/content/actions/create-testimonial";
import { updateTestimonialAction } from "@/features/content/actions/update-testimonial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";

type TestimonialRecord = {
  id: string;
  headline: string;
  quote: string;
  authorName: string;
  authorRole: string;
  company: string;
  imageUrl: string | null;
  sortOrder: number;
};

export function TestimonialForm({ testimonial }: { testimonial?: TestimonialRecord }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(testimonial?.imageUrl ?? null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormValues, unknown, TestimonialInput>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      headline: testimonial?.headline ?? "",
      quote: testimonial?.quote ?? "",
      authorName: testimonial?.authorName ?? "",
      authorRole: testimonial?.authorRole ?? "",
      company: testimonial?.company ?? "",
      sortOrder: testimonial?.sortOrder ?? 0,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);

    const result = testimonial
      ? await updateTestimonialAction(testimonial.id, data, imageFile)
      : await createTestimonialAction(data, imageFile);

    if (result?.errors) {
      const { form, ...fieldErrors } = result.errors;
      if (form) setFormError(form);
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (message) setError(field as keyof TestimonialInput, { message });
      }
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-lg space-y-5">
      {formError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {formError}
        </div>
      )}

      <FormField name="headline" label="Headline" required error={errors.headline?.message}>
        {(props) => <Input {...props} {...register("headline")} />}
      </FormField>

      <FormField name="quote" label="Quote" required error={errors.quote?.message}>
        {(props) => <Textarea {...props} rows={4} {...register("quote")} />}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="authorName" label="Author name" required error={errors.authorName?.message}>
          {(props) => <Input {...props} {...register("authorName")} />}
        </FormField>

        <FormField name="authorRole" label="Author role" required error={errors.authorRole?.message}>
          {(props) => <Input {...props} {...register("authorRole")} />}
        </FormField>
      </div>

      <FormField name="company" label="Company" required error={errors.company?.message}>
        {(props) => <Input {...props} {...register("company")} />}
      </FormField>

      <FormField
        name="sortOrder"
        label="Display order"
        error={errors.sortOrder?.message}
        hint="Lower shows first."
      >
        {(props) => <Input {...props} type="number" {...register("sortOrder")} />}
      </FormField>

      <div className="space-y-2">
        <Label htmlFor="image">Headshot</Label>
        {imagePreview && (
          <Image
            src={imagePreview}
            alt=""
            width={96}
            height={96}
            unoptimized
            className="size-24 rounded-full border bg-card object-cover"
          />
        )}
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }
          }}
          className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        <p className="text-xs text-muted-foreground">
          Optional — falls back to the author&apos;s initials if left empty.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? "Saving…" : testimonial ? "Save changes" : "Create testimonial"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/admin/testimonials")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

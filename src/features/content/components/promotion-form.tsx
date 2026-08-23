"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";

import {
  promotionSchema,
  PROMO_PLACEMENTS,
  PROMO_TONES,
  type PromotionFormValues,
  type PromotionInput,
} from "@/features/content/schemas/promotion.schema";
import { createPromotionAction } from "@/features/content/actions/create-promotion";
import { updatePromotionAction } from "@/features/content/actions/update-promotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLACEMENT_LABELS: Record<(typeof PROMO_PLACEMENTS)[number], string> = {
  hero: "Hero slide",
  banner: "Banner tile",
};

type PromotionRecord = {
  id: string;
  placement: string;
  eyebrow: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string;
  href: string;
  imageUrl: string;
  tone: string;
  sortOrder: number;
};

export function PromotionForm({ promotion }: { promotion?: PromotionRecord }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(promotion?.imageUrl ?? null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormValues, unknown, PromotionInput>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      placement: (promotion?.placement as PromotionInput["placement"]) ?? "banner",
      eyebrow: promotion?.eyebrow ?? "",
      title: promotion?.title ?? "",
      subtitle: promotion?.subtitle ?? "",
      ctaLabel: promotion?.ctaLabel ?? "",
      href: promotion?.href ?? "",
      tone: (promotion?.tone as PromotionInput["tone"]) ?? "slate",
      sortOrder: promotion?.sortOrder ?? 0,
    },
  });

  const selectedPlacement = useWatch({ control, name: "placement" });
  const selectedTone = useWatch({ control, name: "tone" });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);

    const result = promotion
      ? await updatePromotionAction(promotion.id, data, imageFile)
      : await createPromotionAction(data, imageFile);

    if (result?.errors) {
      const { form, image, ...fieldErrors } = result.errors;
      if (form) setFormError(form);
      else if (image) setFormError(image);
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (message) setError(field as keyof PromotionInput, { message });
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

      <div className="space-y-2">
        <Label htmlFor="placement">Where this appears</Label>
        <Select
          value={selectedPlacement}
          onValueChange={(value) =>
            setValue("placement", value as PromotionInput["placement"], { shouldValidate: true })
          }
        >
          <SelectTrigger id="placement" className="w-full">
            <SelectValue>{PLACEMENT_LABELS[selectedPlacement]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PROMO_PLACEMENTS.map((placement) => (
              <SelectItem key={placement} value={placement}>
                {PLACEMENT_LABELS[placement]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Hero slides rotate at the top of the home page. Banner tiles fill the fixed promo slots
          further down, in display-order.
        </p>
      </div>

      <FormField name="eyebrow" label="Eyebrow" required error={errors.eyebrow?.message}>
        {(props) => <Input {...props} {...register("eyebrow")} />}
      </FormField>

      <FormField name="title" label="Title" required error={errors.title?.message}>
        {(props) => <Input {...props} {...register("title")} />}
      </FormField>

      <FormField name="subtitle" label="Subtitle" error={errors.subtitle?.message}>
        {(props) => <Textarea {...props} rows={2} {...register("subtitle")} />}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="ctaLabel" label="Button label" required error={errors.ctaLabel?.message}>
          {(props) => <Input {...props} {...register("ctaLabel")} />}
        </FormField>

        <FormField
          name="href"
          label="Link"
          required
          error={errors.href?.message}
          hint="e.g. /category/insulation-resistance-and-battery"
        >
          {(props) => <Input {...props} {...register("href")} />}
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <Select
            value={selectedTone}
            onValueChange={(value) =>
              setValue("tone", value as PromotionInput["tone"], { shouldValidate: true })
            }
          >
            <SelectTrigger id="tone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROMO_TONES.map((tone) => (
                <SelectItem key={tone} value={tone}>
                  {tone[0].toUpperCase() + tone.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <FormField
          name="sortOrder"
          label="Display order"
          error={errors.sortOrder?.message}
          hint="Lower shows first."
        >
          {(props) => <Input {...props} type="number" {...register("sortOrder")} />}
        </FormField>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        {imagePreview && (
          <Image
            src={imagePreview}
            alt=""
            width={320}
            height={180}
            unoptimized
            className="h-40 w-full max-w-sm rounded-md border bg-card object-cover"
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
        {!promotion && <p className="text-xs text-muted-foreground">Required for a new promotion.</p>}
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? "Saving…" : promotion ? "Save changes" : "Create promotion"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/promotions")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

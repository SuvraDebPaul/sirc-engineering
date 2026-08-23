"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";

import {
  brandSchema,
  type BrandInput,
} from "@/features/catalog/schemas/brand.schema";
import { createBrandAction } from "@/features/catalog/actions/create-brand";
import { updateBrandAction } from "@/features/catalog/actions/update-brand";
import { slugify } from "@/lib/slugify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";

export function BrandForm({
  brand,
}: {
  brand?: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string;
  };
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  // Editing an existing brand starts "touched" — see the identical note in
  // `product-form.tsx`. Only a genuinely new brand auto-fills its slug.
  const [slugTouched, setSlugTouched] = useState(!!brand);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    brand?.logoUrl ?? null,
  );

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BrandInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: brand?.name ?? "",
      slug: brand?.slug ?? "",
    },
  });

  const nameValue = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, slugTouched, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);

    const result = brand
      ? await updateBrandAction(brand.id, data, logoFile)
      : await createBrandAction(data, logoFile);

    if (result?.errors) {
      const { form, logo, ...fieldErrors } = result.errors;
      if (form) setFormError(form);
      else if (logo) setFormError(logo);
      for (const [field, message] of Object.entries(fieldErrors)) {
        setError(field as keyof BrandInput, { message });
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

      <FormField name="name" label="Name" required error={errors.name?.message}>
        {(props) => <Input {...props} {...register("name")} />}
      </FormField>

      <FormField
        name="slug"
        label="Slug"
        required
        error={errors.slug?.message}
        hint="Auto-filled from the name — edit here to customize it."
      >
        {(props) => (
          <Input
            {...props}
            {...register("slug", { onChange: () => setSlugTouched(true) })}
          />
        )}
      </FormField>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo</Label>
        {logoPreview && (
          <Image
            src={logoPreview}
            alt=""
            width={160}
            height={64}
            unoptimized
            className="h-16 w-40 rounded-md border bg-card object-contain p-2"
          />
        )}
        <input
          id="logo"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              setLogoFile(file);
              setLogoPreview(URL.createObjectURL(file));
            }
          }}
          className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
      </div>
      {!brand && (
        <p className="text-xs text-muted-foreground">A logo is required for a new brand.</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isSubmitting ? "Saving…" : brand ? "Save changes" : "Create brand"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/admin/brands")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

"use client";

import { createElement, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";

import {
  categorySchema,
  type CategoryFormValues,
  type CategoryInput,
} from "@/features/catalog/schemas/category.schema";
import { createCategoryAction } from "@/features/catalog/actions/create-category";
import { updateCategoryAction } from "@/features/catalog/actions/update-category";
import { ICON_MAP, type IconName } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/slugify";

const ICON_NAMES = Object.keys(ICON_MAP) as IconName[];

export function CategoryForm({
  category,
  categories,
}: {
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    imageUrl: string | null;
    parentId: string | null;
  };
  /** Every other category — the parent picker's options. */
  categories: { id: string; name: string; parentId: string | null }[];
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    category?.imageUrl ?? null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  // Editing an existing category starts "touched" — see the identical note
  // in `product-form.tsx`. Only a genuinely new category auto-fills its slug.
  const [slugTouched, setSlugTouched] = useState(!!category);

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues, unknown, CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      icon: (category?.icon as IconName) ?? ICON_NAMES[0],
      parentId: category?.parentId ?? "NONE",
    },
  });

  // A category can't become its own parent, and can't be moved under one of
  // its own children — either would make the tree cyclic.
  const parentOptions = categories.filter(
    (entry) => entry.id !== category?.id && entry.parentId !== category?.id,
  );
  const nameValue = useWatch({ control, name: "name" });
  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, slugTouched, setValue]);

  const selectedIcon = useWatch({ control, name: "icon" }) as IconName;
  const selectedParentId = useWatch({ control, name: "parentId" });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);

    const result = category
      ? await updateCategoryAction(category.id, data, imageFile)
      : await createCategoryAction(data, imageFile);

    if (result?.errors) {
      if (result.errors.form) setFormError(result.errors.form);
      for (const [field, message] of Object.entries(result.errors)) {
        if (field !== "form")
          setError(field as keyof CategoryInput, { message });
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
        <Label htmlFor="icon">Icon</Label>
        <Select
          value={selectedIcon}
          onValueChange={(value) =>
            setValue("icon", value as IconName, { shouldValidate: true })
          }
        >
          <SelectTrigger id="icon" className="w-full">
            <SelectValue>
              <span className="flex items-center gap-2">
                {createElement(ICON_MAP[selectedIcon], {
                  className: "size-4",
                  "aria-hidden": true,
                })}
                {selectedIcon}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ICON_NAMES.map((name) => {
              return (
                <SelectItem key={name} value={name}>
                  <span className="flex items-center gap-2">
                    {createElement(ICON_MAP[name], {
                      className: "size-4",
                      "aria-hidden": true,
                    })}
                    {name}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {errors.icon && (
          <p className="text-sm text-destructive">{errors.icon.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Parent category</Label>
        <Select
          value={selectedParentId}
          onValueChange={(value) => setValue("parentId", value, { shouldValidate: true })}
        >
          <SelectTrigger id="parentId" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">None — top-level category</SelectItem>
            {parentOptions.map((entry) => (
              <SelectItem key={entry.id} value={entry.id}>
                {entry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Optional — makes this a subcategory shown under the parent.
        </p>
        {errors.parentId && (
          <p className="text-sm text-destructive">{errors.parentId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <div className="flex items-center gap-4">
          {imagePreview && (
            <Image
              src={imagePreview}
              alt=""
              width={96}
              height={64}
              unoptimized
              className="h-16 w-24 rounded-md border bg-card object-cover"
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
        </div>
        <p className="text-xs text-muted-foreground">
          Optional — falls back to the icon if left empty.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isSubmitting
            ? "Saving…"
            : category
              ? "Save changes"
              : "Create category"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/admin/categories")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

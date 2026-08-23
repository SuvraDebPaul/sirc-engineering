"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

import {
  productSchema,
  type ProductInput,
  type ProductFormValues,
} from "@/features/catalog/schemas/product.schema";
import { createProductAction } from "@/features/catalog/actions/create-product";
import { updateProductAction } from "@/features/catalog/actions/update-product";
import { slugify } from "@/lib/slugify";
import { poishaToTaka } from "@/lib/money";
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

type ProductRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  modelNumber: string;
  categoryId: string;
  brandId: string;
  subCategoryName: string | null;
  badge: string | null;
  retailPrice: number | null;
  compareAtPrice: number | null;
  priceMin: number | null;
  priceMax: number | null;
  stockStatus: string;
  isQuoteOnly: boolean;
  overview: unknown;
  highlights: unknown;
  sections: unknown;
  specs: unknown;
  documents: unknown;
  shipping: unknown;
  leadTimeDays: number;
  warrantyMonths: number;
  imageUrl: string | null;
  images: unknown;
};

const BADGE_OPTIONS = [
  { value: "NONE", label: "No badge" },
  { value: "NEW", label: "New" },
  { value: "TRENDING", label: "Trending" },
  { value: "LOW_STOCK", label: "Low stock" },
  { value: "CLEARANCE", label: "Clearance" },
];

const STOCK_OPTIONS = [
  { value: "IN_STOCK", label: "In stock" },
  { value: "LOW_STOCK", label: "Low stock" },
  { value: "MADE_TO_ORDER", label: "Made to order" },
  { value: "OUT_OF_STOCK", label: "Out of stock" },
];

const DOCUMENT_KINDS = [
  { value: "datasheet", label: "Datasheet" },
  { value: "manual", label: "Manual" },
  { value: "certificate", label: "Certificate" },
  { value: "declaration", label: "Declaration" },
] as const;

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: ProductRecord;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  // Editing an existing product starts "touched" — the slug is already live
  // and must never be silently rewritten just because the stored name and
  // `slugify(name)` don't produce an identical string (a manually-customised
  // slug, for instance). Only a genuinely new product gets the auto-fill.
  const [slugTouched, setSlugTouched] = useState(!!product);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    Array.isArray(product?.images)
      ? (product.images as { url: string }[]).map((i) => i.url)
      : product?.imageUrl
        ? [product.imageUrl]
        : [],
  );

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues, unknown, ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      modelNumber: product?.modelNumber ?? "",
      categoryId: product?.categoryId ?? categories[0]?.id ?? "",
      brandId: product?.brandId ?? brands[0]?.id ?? "",
      subCategoryName: product?.subCategoryName ?? "",
      badge: (product?.badge as ProductInput["badge"]) ?? "NONE",
      retailPrice: poishaToTaka(product?.retailPrice ?? null),
      compareAtPrice: poishaToTaka(product?.compareAtPrice ?? null),
      priceMin: poishaToTaka(product?.priceMin ?? null),
      priceMax: poishaToTaka(product?.priceMax ?? null),
      stockStatus:
        (product?.stockStatus as ProductInput["stockStatus"]) ?? "IN_STOCK",
      isQuoteOnly: product?.isQuoteOnly ?? false,
      overview: Array.isArray(product?.overview)
        ? (product.overview as string[])
        : [],
      highlights: Array.isArray(product?.highlights)
        ? (product.highlights as string[])
        : [],
      sections: Array.isArray(product?.sections)
        ? (product.sections as { title: string; body: string }[])
        : [],
      specs: Array.isArray(product?.specs)
        ? (product.specs as { label: string; value: string }[])
        : [],
      documents: Array.isArray(product?.documents)
        ? (product.documents as {
            title: string;
            kind: "datasheet" | "manual" | "certificate" | "declaration";
            url: string | null;
            sizeLabel?: string;
          }[])
        : [],
      shipping: Array.isArray(product?.shipping)
        ? (product.shipping as string[])
        : [],
      leadTimeDays: product?.leadTimeDays ?? 5,
      warrantyMonths: product?.warrantyMonths ?? 12,
    },
  });

  const nameValue = useWatch({ control, name: "name" });
  const categoryId = useWatch({ control, name: "categoryId" });
  const brandId = useWatch({ control, name: "brandId" });
  const badge = useWatch({ control, name: "badge" });
  const stockStatus = useWatch({ control, name: "stockStatus" });
  const isQuoteOnly = useWatch({ control, name: "isQuoteOnly" });
  const overview = useWatch({ control, name: "overview" });
  const highlights = useWatch({ control, name: "highlights" });
  const shipping = useWatch({ control, name: "shipping" });
  const sections = useWatch({ control, name: "sections" });
  const specs = useWatch({ control, name: "specs" });
  const documents = useWatch({ control, name: "documents" });

  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, slugTouched, setValue]);

  const addSection = () =>
    setValue("sections", [...sections, { title: "", body: "" }], {
      shouldValidate: false,
    });
  const removeSection = (index: number) =>
    setValue(
      "sections",
      sections.filter((_, i) => i !== index),
      { shouldValidate: false },
    );
  const updateSection = (
    index: number,
    patch: Partial<{ title: string; body: string }>,
  ) =>
    setValue(
      "sections",
      sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      { shouldValidate: false },
    );

  const addSpec = () =>
    setValue("specs", [...specs, { label: "", value: "" }], {
      shouldValidate: false,
    });
  const removeSpec = (index: number) =>
    setValue(
      "specs",
      specs.filter((_, i) => i !== index),
      { shouldValidate: false },
    );
  const updateSpec = (
    index: number,
    patch: Partial<{ label: string; value: string }>,
  ) =>
    setValue(
      "specs",
      specs.map((s, i) => (i === index ? { ...s, ...patch } : s)),
      { shouldValidate: false },
    );

  const addDocument = () =>
    setValue(
      "documents",
      [
        ...documents,
        { title: "", kind: "datasheet" as const, url: null, sizeLabel: "" },
      ],
      { shouldValidate: false },
    );
  const removeDocument = (index: number) =>
    setValue(
      "documents",
      documents.filter((_, i) => i !== index),
      { shouldValidate: false },
    );
  const updateDocument = (
    index: number,
    patch: Partial<{
      title: string;
      kind: "datasheet" | "manual" | "certificate" | "declaration";
      url: string | null;
      sizeLabel?: string;
    }>,
  ) =>
    setValue(
      "documents",
      documents.map((d, i) => (i === index ? { ...d, ...patch } : d)),
      { shouldValidate: false },
    );

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);

    const result = product
      ? await updateProductAction(product.id, data, imageFiles)
      : await createProductAction(data, imageFiles);

    if (result?.errors) {
      const { form, images, ...fieldErrors } = result.errors;
      if (form) setFormError(form);
      else if (images) setFormError(images);
      for (const [field, message] of Object.entries(fieldErrors)) {
        setError(field as keyof ProductInput, { message });
      }
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-3xl space-y-8">
      {formError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {formError}
        </div>
      )}

      <section className="space-y-5">
        <h2 className="font-semibold tracking-tight">Basics</h2>

        <FormField
          name="name"
          label="Name"
          required
          error={errors.name?.message}
        >
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

        <FormField
          name="description"
          label="Description"
          required
          error={errors.description?.message}
        >
          {(props) => (
            <Textarea {...props} rows={4} {...register("description")} />
          )}
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            name="modelNumber"
            label="Model number"
            required
            error={errors.modelNumber?.message}
          >
            {(props) => <Input {...props} {...register("modelNumber")} />}
          </FormField>

          <FormField
            name="subCategoryName"
            label="Sub-category tag"
            error={errors.subCategoryName?.message}
            hint="Optional — shown after the middot, e.g. 'Calibration'."
          >
            {(props) => <Input {...props} {...register("subCategoryName")} />}
          </FormField>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-semibold tracking-tight">Organisation</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              value={categoryId}
              onValueChange={(value) =>
                setValue("categoryId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger id="categoryId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandId">Brand</Label>
            <Select
              value={brandId}
              onValueChange={(value) =>
                setValue("brandId", value, { shouldValidate: true })
              }
            >
              <SelectTrigger id="brandId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.brandId && (
              <p className="text-sm text-destructive">
                {errors.brandId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="badge">Badge</Label>
            <Select
              value={badge}
              onValueChange={(value) =>
                setValue("badge", value as ProductInput["badge"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="badge" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BADGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockStatus">Stock status</Label>
            <Select
              value={stockStatus}
              onValueChange={(value) =>
                setValue("stockStatus", value as ProductInput["stockStatus"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="stockStatus" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STOCK_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isQuoteOnly}
            onChange={(event) => setValue("isQuoteOnly", event.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          Quote only — hide pricing, send buyers to the RFQ form
        </label>
      </section>

      <section className="space-y-5">
        <h2 className="font-semibold tracking-tight">Pricing</h2>
        <p className="text-xs text-muted-foreground">
          All amounts in BDT (taka). Leave blank if not applicable.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            name="retailPrice"
            label="Retail price"
            error={errors.retailPrice?.message}
          >
            {(props) => (
              <Input
                {...props}
                inputMode="decimal"
                placeholder="4250.00"
                {...register("retailPrice")}
              />
            )}
          </FormField>
          <FormField
            name="compareAtPrice"
            label="Compare-at price"
            error={errors.compareAtPrice?.message}
            hint="Shown struck through, only if higher than retail."
          >
            {(props) => (
              <Input
                {...props}
                inputMode="decimal"
                placeholder="4790.00"
                {...register("compareAtPrice")}
              />
            )}
          </FormField>
          <FormField
            name="priceMin"
            label="Price range — min"
            error={errors.priceMin?.message}
            hint="Only for products with variants."
          >
            {(props) => (
              <Input {...props} inputMode="decimal" {...register("priceMin")} />
            )}
          </FormField>
          <FormField
            name="priceMax"
            label="Price range — max"
            error={errors.priceMax?.message}
          >
            {(props) => (
              <Input {...props} inputMode="decimal" {...register("priceMax")} />
            )}
          </FormField>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-semibold tracking-tight">Fulfilment</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            name="leadTimeDays"
            label="Lead time (days)"
            required
            error={errors.leadTimeDays?.message}
          >
            {(props) => (
              <Input
                {...props}
                type="number"
                min={1}
                {...register("leadTimeDays")}
              />
            )}
          </FormField>
          <FormField
            name="warrantyMonths"
            label="Warranty (months)"
            required
            error={errors.warrantyMonths?.message}
          >
            {(props) => (
              <Input
                {...props}
                type="number"
                min={0}
                {...register("warrantyMonths")}
              />
            )}
          </FormField>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold tracking-tight">Images</h2>
        <p className="text-xs text-muted-foreground">
          The first image becomes the listing photo.{" "}
          {product
            ? "Upload new images to replace the current set — leave empty to keep them."
            : "At least one is required."}
        </p>

        {imagePreviews.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((url, index) => (
              <div key={url + index} className="relative">
                <Image
                  src={url}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="size-24 rounded-md border bg-card object-cover"
                />
                {index === 0 && (
                  <span className="absolute -top-2 -left-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length === 0) return;
            setImageFiles(files);
            setImagePreviews(files.map((file) => URL.createObjectURL(file)));
          }}
          className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
      </section>

      <section className="space-y-5">
        <h2 className="font-semibold tracking-tight">Description content</h2>

        <div className="space-y-2">
          <Label htmlFor="overview">Overview paragraphs</Label>
          <Textarea
            id="overview"
            rows={4}
            placeholder="One paragraph per line"
            value={overview.join("\n")}
            onChange={(event) =>
              setValue("overview", event.target.value.split("\n"), {
                shouldValidate: false,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="highlights">Highlights</Label>
          <Textarea
            id="highlights"
            rows={3}
            placeholder="One highlight per line"
            value={highlights.join("\n")}
            onChange={(event) =>
              setValue("highlights", event.target.value.split("\n"), {
                shouldValidate: false,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shipping">Shipping notes</Label>
          <Textarea
            id="shipping"
            rows={3}
            placeholder="One line per note"
            value={shipping.join("\n")}
            onChange={(event) =>
              setValue("shipping", event.target.value.split("\n"), {
                shouldValidate: false,
              })
            }
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">Specifications</h2>
          <Button type="button" variant="outline" size="sm" onClick={addSpec}>
            <Plus className="size-4" aria-hidden="true" />
            Add spec
          </Button>
        </div>
        {specs.length === 0 && (
          <p className="text-sm text-muted-foreground">No specs yet.</p>
        )}
        <div className="space-y-2">
          {specs.map((spec, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Label (e.g. Accuracy)"
                value={spec.label}
                onChange={(event) =>
                  updateSpec(index, { label: event.target.value })
                }
                className="flex-1"
              />
              <Input
                placeholder="Value (e.g. ±0.5%)"
                value={spec.value}
                onChange={(event) =>
                  updateSpec(index, { value: event.target.value })
                }
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSpec(index)}
                aria-label="Remove spec"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">Description sections</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSection}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add section
          </Button>
        </div>
        {sections.length === 0 && (
          <p className="text-sm text-muted-foreground">No sections yet.</p>
        )}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Section title"
                  value={section.title}
                  onChange={(event) =>
                    updateSection(index, { title: event.target.value })
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSection(index)}
                  aria-label="Remove section"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
              <Textarea
                placeholder="Section body"
                rows={3}
                value={section.body}
                onChange={(event) =>
                  updateSection(index, { body: event.target.value })
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold tracking-tight">Documents</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDocument}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add document
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Leave URL empty to list it as &quot;request&quot; rather than a broken
          download.
        </p>
        {documents.length === 0 && (
          <p className="text-sm text-muted-foreground">No documents yet.</p>
        )}
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div key={index} className="space-y-2 rounded-lg border p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input
                  placeholder="Title (e.g. User manual)"
                  value={doc.title}
                  onChange={(event) =>
                    updateDocument(index, { title: event.target.value })
                  }
                />
                <Select
                  value={doc.kind}
                  onValueChange={(value) =>
                    updateDocument(index, { kind: value as typeof doc.kind })
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_KINDS.map((kind) => (
                      <SelectItem key={kind.value} value={kind.value}>
                        {kind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_8rem_auto]">
                <Input
                  placeholder="URL (optional)"
                  value={doc.url ?? ""}
                  onChange={(event) =>
                    updateDocument(index, { url: event.target.value || null })
                  }
                />
                <Input
                  placeholder="Size (e.g. 2.4 MB)"
                  value={doc.sizeLabel ?? ""}
                  onChange={(event) =>
                    updateDocument(index, { sizeLabel: event.target.value })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDocument(index)}
                  aria-label="Remove document"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isSubmitting
            ? "Saving…"
            : product
              ? "Save changes"
              : "Create product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

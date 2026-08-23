"use client";

import { createElement, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

import {
  industryScalarSchema,
  type IndustryInput,
  type IndustryScalarInput,
} from "@/features/content/schemas/industry.schema";
import { createIndustryAction } from "@/features/content/actions/create-industry";
import { updateIndustryAction } from "@/features/content/actions/update-industry";
import { slugify } from "@/lib/slugify";
import { ICON_MAP, type IconName } from "@/lib/icons";
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

const ICON_NAMES = Object.keys(ICON_MAP) as IconName[];

type IndustryRecord = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string;
  summary: string;
  intro: unknown;
  needs: unknown;
  categoryNames: unknown;
  serviceSlugs: unknown;
};

const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? (value as string[]) : []);
const asPairArray = (value: unknown): { title: string; body: string }[] =>
  Array.isArray(value) ? (value as { title: string; body: string }[]) : [];

/** A set of checkboxes over a fixed list of options, backed by local `string[]` state. */
function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
              className="size-3.5 rounded border-input accent-primary"
            />
            {option}
          </label>
        ))}
        {options.length === 0 && <p className="text-sm text-muted-foreground">Nothing to pick from yet.</p>}
      </div>
    </div>
  );
}

export function IndustryForm({
  industry,
  categoryOptions,
  serviceOptions,
}: {
  industry?: IndustryRecord;
  /** Category names, for the products-shown picker. */
  categoryOptions: string[];
  /** { slug, title }, for the "services this sector buys" picker. */
  serviceOptions: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!industry);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(industry?.imageUrl ?? null);

  const [intro, setIntro] = useState<string[]>(asStringArray(industry?.intro));
  const [needs, setNeeds] = useState(asPairArray(industry?.needs));
  const [categoryNames, setCategoryNames] = useState<string[]>(asStringArray(industry?.categoryNames));
  const [serviceSlugs, setServiceSlugs] = useState<string[]>(asStringArray(industry?.serviceSlugs));

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IndustryScalarInput>({
    resolver: zodResolver(industryScalarSchema),
    defaultValues: {
      name: industry?.name ?? "",
      slug: industry?.slug ?? "",
      summary: industry?.summary ?? "",
      icon: (industry?.icon as IconName) ?? ICON_NAMES[0],
    },
  });

  const nameValue = useWatch({ control, name: "name" });
  const selectedIcon = useWatch({ control, name: "icon" }) as IconName;

  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(nameValue), { shouldValidate: false });
  }, [nameValue, slugTouched, setValue]);

  const onSubmit = handleSubmit(async (scalarData) => {
    setFormError(null);

    const payload: IndustryInput = { ...scalarData, intro, needs, categoryNames, serviceSlugs };

    const result = industry
      ? await updateIndustryAction(industry.id, payload, imageFile)
      : await createIndustryAction(payload, imageFile);

    if (result?.errors) {
      const { form, image, ...fieldErrors } = result.errors;
      if (form) setFormError(form);
      else if (image) setFormError(image);
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (message) setError(field as keyof IndustryScalarInput, { message });
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
            <Input {...props} {...register("slug", { onChange: () => setSlugTouched(true) })} />
          )}
        </FormField>

        <FormField name="summary" label="Summary" required error={errors.summary?.message}>
          {(props) => <Textarea {...props} rows={2} {...register("summary")} />}
        </FormField>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Select
            value={selectedIcon}
            onValueChange={(value) => setValue("icon", value as IconName, { shouldValidate: true })}
          >
            <SelectTrigger id="icon" className="w-full max-w-xs">
              <SelectValue>
                <span className="flex items-center gap-2">
                  {createElement(ICON_MAP[selectedIcon], { className: "size-4", "aria-hidden": true })}
                  {selectedIcon}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ICON_NAMES.map((name) => (
                <SelectItem key={name} value={name}>
                  <span className="flex items-center gap-2">
                    {createElement(ICON_MAP[name], { className: "size-4", "aria-hidden": true })}
                    {name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-2">
        <Label htmlFor="image">Cover image</Label>
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
        {!industry && <p className="text-xs text-muted-foreground">Required for a new industry.</p>}
      </section>

      <section className="space-y-5">
        <h2 className="font-semibold tracking-tight">Detail page content</h2>

        <div className="space-y-2">
          <Label>Intro paragraphs</Label>
          <Textarea
            rows={4}
            value={intro.join("\n")}
            onChange={(event) =>
              setIntro(event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))
            }
          />
          <p className="text-xs text-muted-foreground">One paragraph per line.</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>What this sector has to measure</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNeeds([...needs, { title: "", body: "" }])}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add item
            </Button>
          </div>
          {needs.map((need, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Title"
                value={need.title}
                onChange={(event) =>
                  setNeeds(needs.map((n, i) => (i === index ? { ...n, title: event.target.value } : n)))
                }
                className="flex-1"
              />
              <Input
                placeholder="Why it matters"
                value={need.body}
                onChange={(event) =>
                  setNeeds(needs.map((n, i) => (i === index ? { ...n, body: event.target.value } : n)))
                }
                className="flex-[2]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setNeeds(needs.filter((_, i) => i !== index))}
                aria-label="Remove item"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>

        <MultiSelect
          label="Product categories shown on this page"
          options={categoryOptions}
          selected={categoryNames}
          onChange={setCategoryNames}
        />

        <MultiSelect
          label="Services this sector buys most"
          options={serviceOptions.map((s) => s.slug)}
          selected={serviceSlugs}
          onChange={setServiceSlugs}
        />
      </section>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? "Saving…" : industry ? "Save changes" : "Create industry"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/industries")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

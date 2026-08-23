"use client";

import { createElement, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";

import {
  serviceScalarSchema,
  type ServiceInput,
  type ServiceScalarFormValues,
  type ServiceScalarInput,
} from "@/features/content/schemas/service.schema";
import { createServiceAction } from "@/features/content/actions/create-service";
import { updateServiceAction } from "@/features/content/actions/update-service";
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

/** A `string[]` field edited as one line of a textarea per entry. */
function LineListField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        rows={4}
        value={value.join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          )
        }
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type ServiceRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  imageUrl: string;
  turnaroundDays: number;
  onSite: boolean;
  overview: unknown;
  scope: unknown;
  deliverables: unknown;
  process: unknown;
  faqs: unknown;
};

const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? (value as string[]) : []);
const asPairArray = (value: unknown): { title: string; body: string }[] =>
  Array.isArray(value) ? (value as { title: string; body: string }[]) : [];
const asFaqArray = (value: unknown): { question: string; answer: string }[] =>
  Array.isArray(value) ? (value as { question: string; answer: string }[]) : [];

export function ServiceForm({ service }: { service?: ServiceRecord }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!service);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(service?.imageUrl ?? null);

  const [overview, setOverview] = useState<string[]>(asStringArray(service?.overview));
  const [scope, setScope] = useState<string[]>(asStringArray(service?.scope));
  const [deliverables, setDeliverables] = useState<string[]>(asStringArray(service?.deliverables));
  const [process, setProcess] = useState(asPairArray(service?.process));
  const [faqs, setFaqs] = useState(asFaqArray(service?.faqs));

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceScalarFormValues, unknown, ServiceScalarInput>({
    resolver: zodResolver(serviceScalarSchema),
    defaultValues: {
      title: service?.title ?? "",
      slug: service?.slug ?? "",
      description: service?.description ?? "",
      icon: (service?.icon as IconName) ?? ICON_NAMES[0],
      turnaroundDays: service?.turnaroundDays ?? 5,
      onSite: service?.onSite ?? true,
    },
  });

  const nameValue = useWatch({ control, name: "title" });
  const selectedIcon = useWatch({ control, name: "icon" }) as IconName;
  const onSite = useWatch({ control, name: "onSite" });

  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(nameValue), { shouldValidate: false });
  }, [nameValue, slugTouched, setValue]);

  const onSubmit = handleSubmit(async (scalarData) => {
    setFormError(null);

    const payload: ServiceInput = { ...scalarData, overview, scope, deliverables, process, faqs };

    const result = service
      ? await updateServiceAction(service.id, payload, imageFile)
      : await createServiceAction(payload, imageFile);

    if (result?.errors) {
      const { form, image, ...fieldErrors } = result.errors;
      if (form) setFormError(form);
      else if (image) setFormError(image);
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (message) setError(field as keyof ServiceScalarInput, { message });
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

        <FormField name="title" label="Title" required error={errors.title?.message}>
          {(props) => <Input {...props} {...register("title")} />}
        </FormField>

        <FormField
          name="slug"
          label="Slug"
          required
          error={errors.slug?.message}
          hint="Auto-filled from the title — also used as the RFQ enquiry-type value where it matches one."
        >
          {(props) => (
            <Input {...props} {...register("slug", { onChange: () => setSlugTouched(true) })} />
          )}
        </FormField>

        <FormField name="description" label="Description" required error={errors.description?.message}>
          {(props) => <Textarea {...props} rows={3} {...register("description")} />}
        </FormField>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={selectedIcon}
              onValueChange={(value) => setValue("icon", value as IconName, { shouldValidate: true })}
            >
              <SelectTrigger id="icon" className="w-full">
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

          <FormField
            name="turnaroundDays"
            label="Turnaround (days)"
            required
            error={errors.turnaroundDays?.message}
          >
            {(props) => <Input {...props} type="number" min={1} {...register("turnaroundDays")} />}
          </FormField>

          <label className="flex items-center gap-2 pt-7 text-sm">
            <input
              type="checkbox"
              checked={onSite}
              onChange={(event) => setValue("onSite", event.target.checked)}
              className="size-4 rounded border-input accent-primary"
            />
            Available on-site
          </label>
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
        {!service && <p className="text-xs text-muted-foreground">Required for a new service.</p>}
      </section>

      <section className="space-y-5">
        <h2 className="font-semibold tracking-tight">Detail page content</h2>

        <LineListField
          label="Overview paragraphs"
          hint="One paragraph per line — 'What this covers'."
          value={overview}
          onChange={setOverview}
        />
        <LineListField
          label="Scope"
          hint="One item per line — shown in the sidebar."
          value={scope}
          onChange={setScope}
        />
        <LineListField
          label="Deliverables"
          hint="One item per line — 'What you receive'."
          value={deliverables}
          onChange={setDeliverables}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Process steps</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setProcess([...process, { title: "", body: "" }])}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add step
            </Button>
          </div>
          {process.map((step, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="Step title"
                value={step.title}
                onChange={(event) =>
                  setProcess(process.map((s, i) => (i === index ? { ...s, title: event.target.value } : s)))
                }
                className="flex-1"
              />
              <Input
                placeholder="Step description"
                value={step.body}
                onChange={(event) =>
                  setProcess(process.map((s, i) => (i === index ? { ...s, body: event.target.value } : s)))
                }
                className="flex-[2]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setProcess(process.filter((_, i) => i !== index))}
                aria-label="Remove step"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>FAQs</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add FAQ
            </Button>
          </div>
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-2 rounded-xl border p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Question"
                  value={faq.question}
                  onChange={(event) =>
                    setFaqs(faqs.map((f, i) => (i === index ? { ...f, question: event.target.value } : f)))
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                  aria-label="Remove FAQ"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
              <Textarea
                placeholder="Answer"
                rows={2}
                value={faq.answer}
                onChange={(event) =>
                  setFaqs(faqs.map((f, i) => (i === index ? { ...f, answer: event.target.value } : f)))
                }
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? "Saving…" : service ? "Save changes" : "Create service"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/services")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

"use client";

import { createElement, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";

import {
  featureSchema,
  type FeatureFormValues,
  type FeatureInput,
} from "@/features/content/schemas/feature.schema";
import { createFeatureAction } from "@/features/content/actions/create-feature";
import { updateFeatureAction } from "@/features/content/actions/update-feature";
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

const ICON_NAMES = Object.keys(ICON_MAP) as IconName[];

type FeatureRecord = {
  id: string;
  icon: string;
  title: string;
  description: string;
  sortOrder: number;
};

export function FeatureForm({ feature }: { feature?: FeatureRecord }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FeatureFormValues, unknown, FeatureInput>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      icon: (feature?.icon as IconName) ?? ICON_NAMES[0],
      title: feature?.title ?? "",
      description: feature?.description ?? "",
      sortOrder: feature?.sortOrder ?? 0,
    },
  });

  const selectedIcon = useWatch({ control, name: "icon" }) as IconName;

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);

    const result = feature
      ? await updateFeatureAction(feature.id, data)
      : await createFeatureAction(data);

    if (result?.errors) {
      const { form, ...fieldErrors } = result.errors;
      if (form) setFormError(form);
      for (const [field, message] of Object.entries(fieldErrors)) {
        if (message) setError(field as keyof FeatureInput, { message });
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

      <FormField name="title" label="Title" required error={errors.title?.message}>
        {(props) => <Input {...props} {...register("title")} />}
      </FormField>

      <FormField name="description" label="Description" required error={errors.description?.message}>
        {(props) => <Input {...props} {...register("description")} />}
      </FormField>

      <FormField
        name="sortOrder"
        label="Display order"
        error={errors.sortOrder?.message}
        hint="Lower shows first."
      >
        {(props) => <Input {...props} type="number" {...register("sortOrder")} />}
      </FormField>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? "Saving…" : feature ? "Save changes" : "Create feature"}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/features")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

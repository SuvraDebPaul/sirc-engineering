"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  featureSchema,
  type FeatureInput,
} from "@/features/content/schemas/feature.schema";
import { updateFeature } from "@/features/content/services/feature-admin";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface FeatureFormResult {
  errors?: Partial<Record<keyof FeatureInput | "form", string>>;
}

export async function updateFeatureAction(
  id: string,
  data: FeatureInput,
): Promise<FeatureFormResult | void> {
  await requireStaffSession();

  const result = featureSchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  try {
    await updateFeature(id, result.data);
  } catch (error) {
    return { errors: { form: logUnexpectedError("update-feature", error) } };
  }

  revalidatePath("/admin/features");
  revalidatePath("/", "layout");
  redirect("/admin/features");
}

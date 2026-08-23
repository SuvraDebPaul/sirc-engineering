"use server";

import { revalidatePath } from "next/cache";

import { deleteFeature } from "@/features/content/services/feature-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function deleteFeatureAction(id: string): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await deleteFeature(id);
  } catch (error) {
    return { error: logUnexpectedError("delete-feature", error) };
  }

  revalidatePath("/admin/features");
  revalidatePath("/", "layout");
}

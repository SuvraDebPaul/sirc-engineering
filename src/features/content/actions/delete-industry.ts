"use server";

import { revalidatePath } from "next/cache";

import { deleteIndustry } from "@/features/content/services/industry-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function deleteIndustryAction(id: string): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await deleteIndustry(id);
  } catch (error) {
    return { error: logUnexpectedError("delete-industry", error) };
  }

  revalidatePath("/admin/industries");
  revalidatePath("/", "layout");
}

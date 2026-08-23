"use server";

import { revalidatePath } from "next/cache";

import { deleteService } from "@/features/content/services/service-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function deleteServiceAction(id: string): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await deleteService(id);
  } catch (error) {
    return { error: logUnexpectedError("delete-service", error) };
  }

  revalidatePath("/admin/services");
  revalidatePath("/", "layout");
}

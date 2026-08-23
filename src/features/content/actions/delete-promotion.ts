"use server";

import { revalidatePath } from "next/cache";

import { deletePromotion } from "@/features/content/services/promotion-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function deletePromotionAction(id: string): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await deletePromotion(id);
  } catch (error) {
    return { error: logUnexpectedError("delete-promotion", error) };
  }

  revalidatePath("/admin/promotions");
  revalidatePath("/", "layout");
}

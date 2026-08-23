"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  promotionSchema,
  type PromotionInput,
} from "@/features/content/schemas/promotion.schema";
import {
  getPromotionByIdAdmin,
  updatePromotion,
} from "@/features/content/services/promotion-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface PromotionFormResult {
  errors?: Partial<Record<keyof PromotionInput | "image" | "form", string>>;
}

export async function updatePromotionAction(
  id: string,
  data: PromotionInput,
  imageFile: File | null,
): Promise<PromotionFormResult | void> {
  await requireStaffSession();

  const result = promotionSchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  try {
    const existing = await getPromotionByIdAdmin(id);
    let imageUrl = existing?.imageUrl ?? "";
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile, "sirc/promotions");
    }

    await updatePromotion(id, { ...result.data, subtitle: result.data.subtitle || null, imageUrl });
  } catch (error) {
    return { errors: { form: logUnexpectedError("update-promotion", error) } };
  }

  revalidatePath("/admin/promotions");
  revalidatePath("/", "layout");
  redirect("/admin/promotions");
}

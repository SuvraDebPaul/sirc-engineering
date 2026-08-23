"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  promotionSchema,
  type PromotionInput,
} from "@/features/content/schemas/promotion.schema";
import { createPromotion } from "@/features/content/services/promotion-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface PromotionFormResult {
  errors?: Partial<Record<keyof PromotionInput | "image" | "form", string>>;
}

export async function createPromotionAction(
  data: PromotionInput,
  imageFile: File | null,
): Promise<PromotionFormResult | void> {
  await requireStaffSession();

  const result = promotionSchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  if (!imageFile || imageFile.size === 0) {
    return { errors: { image: "An image is required." } };
  }

  try {
    const imageUrl = await uploadImage(imageFile, "sirc/promotions");
    await createPromotion({ ...result.data, subtitle: result.data.subtitle || null, imageUrl });
  } catch (error) {
    return { errors: { form: logUnexpectedError("create-promotion", error) } };
  }

  revalidatePath("/admin/promotions");
  revalidatePath("/", "layout");
  redirect("/admin/promotions");
}

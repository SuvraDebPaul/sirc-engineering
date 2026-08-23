"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  testimonialSchema,
  type TestimonialInput,
} from "@/features/content/schemas/testimonial.schema";
import { createTestimonial } from "@/features/content/services/testimonial-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface TestimonialFormResult {
  errors?: Partial<Record<keyof TestimonialInput | "form", string>>;
}

export async function createTestimonialAction(
  data: TestimonialInput,
  imageFile: File | null,
): Promise<TestimonialFormResult | void> {
  await requireStaffSession();

  const result = testimonialSchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  try {
    const imageUrl =
      imageFile && imageFile.size > 0 ? await uploadImage(imageFile, "sirc/testimonials") : null;
    await createTestimonial({ ...result.data, imageUrl });
  } catch (error) {
    return { errors: { form: logUnexpectedError("create-testimonial", error) } };
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
  redirect("/admin/testimonials");
}

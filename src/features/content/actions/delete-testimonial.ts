"use server";

import { revalidatePath } from "next/cache";

import { deleteTestimonial } from "@/features/content/services/testimonial-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function deleteTestimonialAction(id: string): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await deleteTestimonial(id);
  } catch (error) {
    return { error: logUnexpectedError("delete-testimonial", error) };
  }

  revalidatePath("/admin/testimonials");
  revalidatePath("/", "layout");
}

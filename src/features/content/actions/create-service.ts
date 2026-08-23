"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/lib/db/prisma";
import {
  serviceSchema,
  type ServiceInput,
} from "@/features/content/schemas/service.schema";
import { createService } from "@/features/content/services/service-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface ServiceFormResult {
  errors?: Partial<Record<keyof ServiceInput | "image" | "form", string>>;
}

export async function createServiceAction(
  data: ServiceInput,
  imageFile: File | null,
): Promise<ServiceFormResult | void> {
  await requireStaffSession();

  const result = serviceSchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  if (!imageFile || imageFile.size === 0) {
    return { errors: { image: "A cover image is required." } };
  }

  try {
    const imageUrl = await uploadImage(imageFile, "sirc/services");
    await createService({ ...result.data, imageUrl });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { errors: { slug: "That slug is already used by another service." } };
    }
    return { errors: { form: logUnexpectedError("create-service", error) } };
  }

  revalidatePath("/admin/services");
  revalidatePath("/", "layout");
  redirect("/admin/services");
}

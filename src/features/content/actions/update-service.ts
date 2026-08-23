"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/lib/db/prisma";
import {
  serviceSchema,
  type ServiceInput,
} from "@/features/content/schemas/service.schema";
import {
  getServiceByIdAdmin,
  updateService,
} from "@/features/content/services/service-admin";
import { uploadImage } from "@/lib/cloudinary";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface ServiceFormResult {
  errors?: Partial<Record<keyof ServiceInput | "image" | "form", string>>;
}

export async function updateServiceAction(
  id: string,
  data: ServiceInput,
  imageFile: File | null,
): Promise<ServiceFormResult | void> {
  await requireStaffSession();

  const result = serviceSchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  let existingSlug: string | null = null;

  try {
    const existing = await getServiceByIdAdmin(id);
    existingSlug = existing?.slug ?? null;
    let imageUrl = existing?.imageUrl ?? "";
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile, "sirc/services");
    }

    await updateService(id, { ...result.data, imageUrl });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { errors: { slug: "That slug is already used by another service." } };
    }
    return { errors: { form: logUnexpectedError("update-service", error) } };
  }

  revalidatePath("/admin/services");
  revalidatePath("/", "layout");
  if (existingSlug) revalidatePath(`/services/${existingSlug}`);
  if (existingSlug !== result.data.slug) revalidatePath(`/services/${result.data.slug}`);
  redirect("/admin/services");
}

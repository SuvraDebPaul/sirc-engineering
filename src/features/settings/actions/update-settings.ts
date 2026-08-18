"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/db/auth";
import { uploadImage } from "@/lib/cloudinary";
import {
  getSiteSettings,
  saveSiteSettings,
  validateSettingsForm,
} from "@/features/settings/services/settings";
import type { SettingsFormState } from "@/features/settings/types/settings";

/**
 * Update the sitewide settings.
 *
 * A logo file is optional on every submit — the admin is usually only
 * changing a phone number, not re-uploading a logo. Only touch `logoUrl`
 * when a real file came through; otherwise keep whatever is already stored.
 */
export async function updateSiteSettings(
  _previous: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin/login");

  const result = validateSettingsForm(formData);
  if (!result.ok) {
    return { status: "error", errors: result.errors };
  }

  const logoFile = formData.get("logo");
  let logoUrl = (await getSiteSettings()).logoUrl;

  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      logoUrl = await uploadImage(logoFile, "sirc/site");
    } catch {
      return {
        status: "error",
        errors: { form: "The logo could not be uploaded. Please try again." },
      };
    }
  }

  try {
    await saveSiteSettings({ ...result.data, logoUrl });
  } catch {
    return {
      status: "error",
      errors: {
        form: "Settings could not be saved just now. Please try again.",
      },
    };
  }

  revalidatePath("/", "layout");
  return { status: "success", errors: {} };
}

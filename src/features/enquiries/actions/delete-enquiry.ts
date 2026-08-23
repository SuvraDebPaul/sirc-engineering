"use server";

import { revalidatePath } from "next/cache";

import { deleteEnquiry } from "@/features/enquiries/services/enquiry-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function deleteEnquiryAction(id: string): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await deleteEnquiry(id);
  } catch (error) {
    return { error: logUnexpectedError("delete-enquiry", error) };
  }

  revalidatePath("/admin/enquiries");
}

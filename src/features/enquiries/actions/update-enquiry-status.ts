"use server";

import { revalidatePath } from "next/cache";

import { updateEnquiryStatus } from "@/features/enquiries/services/enquiry-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function updateEnquiryStatusAction(
  id: string,
  status: "NEW" | "RESPONDED" | "CLOSED",
): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await updateEnquiryStatus(id, status);
  } catch (error) {
    return { error: logUnexpectedError("update-enquiry-status", error) };
  }

  revalidatePath("/admin/enquiries");
}

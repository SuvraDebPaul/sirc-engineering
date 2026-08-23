"use server";

import { revalidatePath } from "next/cache";

import { markOrderPaid } from "@/features/orders/services/order-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export async function markOrderPaidAction(id: string): Promise<{ error?: string } | void> {
  await requireStaffSession();

  try {
    await markOrderPaid(id);
  } catch (error) {
    return { error: logUnexpectedError("mark-order-paid", error) };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

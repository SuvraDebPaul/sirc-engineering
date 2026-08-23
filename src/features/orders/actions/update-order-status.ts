"use server";

import { revalidatePath } from "next/cache";

import { updateOrderStatus } from "@/features/orders/services/order-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

const ORDER_STATUSES = ["PENDING", "PROCESSING", "FULFILLED", "CANCELLED"];

export async function updateOrderStatusAction(
  id: string,
  status: string,
): Promise<{ error?: string } | void> {
  await requireStaffSession();

  if (!ORDER_STATUSES.includes(status)) {
    return { error: "Not a valid order status." };
  }

  try {
    await updateOrderStatus(id, status);
  } catch (error) {
    return { error: logUnexpectedError("update-order-status", error) };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

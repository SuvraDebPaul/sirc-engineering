"use server";

import { revalidatePath } from "next/cache";

import { setUserRole, type AssignableRole } from "@/features/account/services/team-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

export interface UpdateStaffRoleResult {
  error?: string;
}

/**
 * Change an existing staff member's role, or remove their staff access
 * entirely (`role: "customer"`).
 *
 * Blocks changing your own role — the whole point is another admin having to
 * do it, so a single admin account can't lock itself out by demoting itself
 * with nobody else around to undo it.
 */
export async function updateStaffRoleAction(
  userId: string,
  role: AssignableRole,
): Promise<UpdateStaffRoleResult | void> {
  const session = await requireStaffSession();

  if (session.user.id === userId) {
    return { error: "You can't change your own role. Ask another admin to do this." };
  }

  try {
    await setUserRole(userId, role);
  } catch (error) {
    return { error: logUnexpectedError("update-staff-role", error) };
  }

  revalidatePath("/admin/team");
  revalidatePath("/admin/customers");
}

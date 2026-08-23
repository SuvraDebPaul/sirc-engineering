"use server";

import { revalidatePath } from "next/cache";

import {
  findUserByEmailAdmin,
  setUserRole,
  type StaffRole,
} from "@/features/account/services/team-admin";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireStaffSession } from "@/lib/require-staff";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const STAFF_ROLES: StaffRole[] = ["admin", "manager"];

export interface PromoteUserResult {
  error?: string;
  success?: boolean;
}

/**
 * Give an existing account admin or manager access.
 *
 * Only promotes accounts that already exist — there is no invite-by-email
 * flow, so someone has to sign up (or be created via `/admin/customers`
 * eventually) before they can be made staff. Telling the admin that plainly
 * beats a confusing "no such user" error.
 */
export async function promoteUserAction(email: string, role: StaffRole): Promise<PromoteUserResult> {
  await requireStaffSession();

  const trimmed = email.trim();
  if (!EMAIL.test(trimmed)) {
    return { error: "That does not look like an email address." };
  }
  if (!STAFF_ROLES.includes(role)) {
    return { error: "Choose Admin or Manager." };
  }

  try {
    const user = await findUserByEmailAdmin(trimmed);
    if (!user) {
      return {
        error: "No account with that email. They need to create an account first — ask them to sign up, then promote them here.",
      };
    }

    await setUserRole(user.id, role);
  } catch (error) {
    return { error: logUnexpectedError("promote-user", error) };
  }

  revalidatePath("/admin/team");
  revalidatePath("/admin/customers");
  return { success: true };
}

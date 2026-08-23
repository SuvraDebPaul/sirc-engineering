"use server";

import { revalidatePath } from "next/cache";

import { deleteAddress, getAddressForUser } from "@/features/account/services/addresses";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireSession } from "@/lib/require-session";

export async function deleteAddressAction(id: string): Promise<{ error?: string } | void> {
  const session = await requireSession();

  const owned = await getAddressForUser(session.user.id, id);
  if (!owned) return { error: "That address could not be found." };

  try {
    await deleteAddress(id);
  } catch (error) {
    return { error: logUnexpectedError("delete-address", error) };
  }

  revalidatePath("/account/addresses");
}

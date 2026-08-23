"use server";

import { revalidatePath } from "next/cache";

import { getAddressForUser, setDefaultAddress } from "@/features/account/services/addresses";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireSession } from "@/lib/require-session";

export async function setDefaultAddressAction(id: string): Promise<{ error?: string } | void> {
  const session = await requireSession();

  const owned = await getAddressForUser(session.user.id, id);
  if (!owned) return { error: "That address could not be found." };

  try {
    await setDefaultAddress(session.user.id, id);
  } catch (error) {
    return { error: logUnexpectedError("set-default-address", error) };
  }

  revalidatePath("/account/addresses");
}

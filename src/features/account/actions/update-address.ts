"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  addressSchema,
  type AddressInput,
} from "@/features/account/schemas/address.schema";
import { getAddressForUser, updateAddress } from "@/features/account/services/addresses";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { requireSession } from "@/lib/require-session";

export interface AddressFormResult {
  errors?: Partial<Record<keyof AddressInput | "form", string>>;
}

export async function updateAddressAction(
  id: string,
  data: AddressInput,
): Promise<AddressFormResult | void> {
  const session = await requireSession();

  const owned = await getAddressForUser(session.user.id, id);
  if (!owned) return { errors: { form: "That address could not be found." } };

  const result = addressSchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  try {
    await updateAddress(id, result.data);
  } catch (error) {
    return { errors: { form: logUnexpectedError("update-address", error) } };
  }

  revalidatePath("/account/addresses");
  redirect("/account/addresses");
}

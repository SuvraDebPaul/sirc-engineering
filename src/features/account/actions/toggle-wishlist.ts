"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/db/auth";
import { toggleWishlistItem } from "@/features/account/services/wishlist";
import { logUnexpectedError } from "@/lib/log-unexpected-error";

/**
 * The server-side mirror of a wishlist toggle.
 *
 * Called from two places: the account wishlist page (removing a saved item),
 * and — fire-and-forget, from the shared `useCart()` toggle — every product
 * card and buy box, so a signed-in customer's saves are captured without
 * changing how the guest-facing localStorage wishlist behaves at all. No
 * redirect on a missing session: a signed-out visitor calling this from a
 * product card should just see nothing happen server-side, not get bounced
 * to the login page mid-browse.
 */
export async function toggleWishlistAction(
  productId: string,
): Promise<{ error?: string; wishlisted?: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Not signed in." };

  try {
    const wishlisted = await toggleWishlistItem(session.user.id, productId);
    revalidatePath("/account/wishlist");
    return { wishlisted };
  } catch (error) {
    return { error: logUnexpectedError("toggle-wishlist", error) };
  }
}

"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/db/auth";
import { reviewSchema, type ReviewInput } from "@/features/reviews/schemas/review.schema";
import { upsertReview } from "@/features/reviews/services/review";
import { firstFieldErrors } from "@/lib/format-zod-errors";
import { logUnexpectedError } from "@/lib/log-unexpected-error";
import { checkRateLimit, rateLimitMessage } from "@/lib/rate-limit";

export interface ReviewFormResult {
  errors?: Partial<Record<keyof ReviewInput | "form", string>>;
  success?: boolean;
}

export async function submitReviewAction(
  productId: string,
  productSlug: string,
  data: ReviewInput,
): Promise<ReviewFormResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { errors: { form: "Please sign in to write a review." } };
  }

  // Already gated behind a signed-in account and `upsertReview` naturally
  // caps a user to one row per product — this is a lighter defense-in-depth
  // limit against a compromised or scripted account hammering the endpoint.
  const limit = checkRateLimit(`review:${session.user.id}`, 10, 10 * 60 * 1000);
  if (!limit.ok) {
    return { errors: { form: rateLimitMessage(limit.retryAfterSeconds!) } };
  }

  const result = reviewSchema.safeParse(data);
  if (!result.success) {
    return { errors: firstFieldErrors(z.flattenError(result.error).fieldErrors) };
  }

  try {
    await upsertReview(productId, session.user.id, result.data);
  } catch (error) {
    return { errors: { form: logUnexpectedError("submit-review", error) } };
  }

  revalidatePath(`/product/${productSlug}`);
  return { success: true };
}

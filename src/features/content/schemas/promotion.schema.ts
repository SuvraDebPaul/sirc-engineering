import { z } from "zod";

export const PROMO_PLACEMENTS = ["hero", "banner"] as const;
export const PROMO_TONES = ["dark", "amber", "slate", "brand"] as const;

export const promotionSchema = z.object({
  placement: z.enum(PROMO_PLACEMENTS, { message: "Choose where this appears." }),
  eyebrow: z.string().trim().min(1, "Eyebrow is required.").max(60, "Keep it under 60 characters."),
  title: z.string().trim().min(2, "Title is required.").max(120, "That title is too long."),
  subtitle: z
    .string()
    .trim()
    .max(200, "Keep the subtitle under 200 characters.")
    .optional()
    .or(z.literal("")),
  ctaLabel: z.string().trim().min(1, "Button label is required.").max(40, "Keep it under 40 characters."),
  href: z.string().trim().min(1, "Link is required."),
  tone: z.enum(PROMO_TONES, { message: "Choose a tone." }),
  sortOrder: z.coerce.number().int().default(0),
});

export type PromotionInput = z.infer<typeof promotionSchema>;
/** `useForm()`'s first generic — `sortOrder` is optional pre-coercion because of `.default()`. */
export type PromotionFormValues = z.input<typeof promotionSchema>;

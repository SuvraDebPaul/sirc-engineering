import { z } from "zod";

import { ICON_MAP } from "@/lib/icons";

const ICON_NAMES = Object.keys(ICON_MAP);

export const featureSchema = z.object({
  icon: z.enum(ICON_NAMES, { message: "Choose a valid icon." }),
  title: z.string().trim().min(2, "Title is required.").max(80, "That title is too long."),
  description: z
    .string()
    .trim()
    .min(2, "Description is required.")
    .max(160, "Keep the description under 160 characters."),
  sortOrder: z.coerce.number().int().default(0),
});

export type FeatureInput = z.infer<typeof featureSchema>;
/** `useForm()`'s first generic — `sortOrder` is optional pre-coercion because of `.default()`. */
export type FeatureFormValues = z.input<typeof featureSchema>;

import { z } from "zod";

import { ICON_MAP } from "@/lib/icons";

const ICON_NAMES = Object.keys(ICON_MAP);

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name is required.")
    .max(80, "That name is too long."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(80, "That slug is too long.")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers and hyphens only (e.g. "electrical-tools").',
    ),
  icon: z.enum(ICON_NAMES, { message: "Choose a valid icon." }),
  /** "NONE" means top-level — mapped to a null `parentId` at the write boundary. */
  parentId: z.string().default("NONE"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
/** `useForm()`'s first generic — `parentId` is optional pre-coercion because of its `.default()`. */
export type CategoryFormValues = z.input<typeof categorySchema>;

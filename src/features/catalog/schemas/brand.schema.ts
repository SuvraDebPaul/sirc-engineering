import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Brand name is required.")
    .max(80, "That name is too long."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(80, "That slug is too long.")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers and hyphens only (e.g. "fluke-corporation").',
    ),
});

export type BrandInput = z.infer<typeof brandSchema>;

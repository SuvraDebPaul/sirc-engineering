import { z } from "zod";

import { ICON_MAP } from "@/lib/icons";

const ICON_NAMES = Object.keys(ICON_MAP);

const needSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  body: z.string().trim().min(1, "Body is required."),
});

export const industrySchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(120, "That name is too long."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(120, "That slug is too long.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only."),
  summary: z.string().trim().min(10, "Please add a summary.").max(300, "Keep the summary under 300 characters."),
  icon: z.enum(ICON_NAMES, { message: "Choose a valid icon." }),
  intro: z.array(z.string().trim().min(1)),
  needs: z.array(needSchema),
  categoryNames: z.array(z.string()),
  serviceSlugs: z.array(z.string()),
});

export type IndustryInput = z.infer<typeof industrySchema>;

/**
 * The subset `useForm`'s resolver actually validates.
 *
 * `intro`/`needs`/`categoryNames`/`serviceSlugs` live in the form as plain
 * `useState`, not registered RHF fields, so validating the full
 * `industrySchema` against RHF's own values would reject every submission on
 * those "missing" keys before `onSubmit` ever ran. The full schema still
 * validates the merged payload server-side in the create/update actions.
 */
export const industryScalarSchema = industrySchema.omit({
  intro: true,
  needs: true,
  categoryNames: true,
  serviceSlugs: true,
});
export type IndustryScalarInput = z.infer<typeof industryScalarSchema>;

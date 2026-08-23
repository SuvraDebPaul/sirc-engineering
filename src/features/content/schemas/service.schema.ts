import { z } from "zod";

import { ICON_MAP } from "@/lib/icons";

const ICON_NAMES = Object.keys(ICON_MAP);

const processStepSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  body: z.string().trim().min(1, "Body is required."),
});

const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required."),
  answer: z.string().trim().min(1, "Answer is required."),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(2, "Title is required.").max(120, "That title is too long."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(120, "That slug is too long.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only."),
  description: z.string().trim().min(10, "Please add a description."),
  icon: z.enum(ICON_NAMES, { message: "Choose a valid icon." }),
  turnaroundDays: z.coerce.number().int().positive("Must be at least 1 day."),
  onSite: z.boolean(),
  overview: z.array(z.string().trim().min(1)),
  scope: z.array(z.string().trim().min(1)),
  deliverables: z.array(z.string().trim().min(1)),
  process: z.array(processStepSchema),
  faqs: z.array(faqSchema),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
/** `useForm()`'s first generic — `turnaroundDays` is looser pre-coercion because of `z.coerce`. */
export type ServiceFormValues = z.input<typeof serviceSchema>;

/**
 * The subset `useForm`'s resolver actually validates.
 *
 * `overview`/`scope`/`deliverables`/`process`/`faqs` live in the form as
 * plain `useState`, not registered RHF fields, so validating the full
 * `serviceSchema` against RHF's own values would reject every submission on
 * those "missing" keys before `onSubmit` ever ran. The full schema still
 * validates the merged payload server-side in the create/update actions.
 */
export const serviceScalarSchema = serviceSchema.omit({
  overview: true,
  scope: true,
  deliverables: true,
  process: true,
  faqs: true,
});
export type ServiceScalarInput = z.infer<typeof serviceScalarSchema>;
/** `useForm()`'s first generic for the scalar subset — `turnaroundDays` is looser pre-coercion. */
export type ServiceScalarFormValues = z.input<typeof serviceScalarSchema>;

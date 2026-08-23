import { z } from "zod";

const specRowSchema = z.object({
  label: z.string().trim().min(1, "Label is required."),
  value: z.string().trim().min(1, "Value is required."),
});

const sectionSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  body: z.string().trim().min(1, "Body is required."),
});

const documentSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  kind: z.enum(["datasheet", "manual", "certificate", "declaration"]),
  url: z.string().trim().nullable(),
  sizeLabel: z.string().trim().optional(),
});

const MONEY = /^\d*\.?\d{0,2}$/;
const optionalMoney = z
  .string()
  .trim()
  .regex(MONEY, "Enter a valid amount, e.g. 4250.00")
  .or(z.literal(""));

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name is required.")
    .max(200, "That name is too long."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(200, "That slug is too long.")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and hyphens only.",
    ),
  description: z.string().trim().min(10, "Please add a description."),
  modelNumber: z.string().trim().min(1, "Model number is required."),

  categoryId: z.string().min(1, "Choose a category."),
  brandId: z.string().min(1, "Choose a brand."),
  subCategoryName: z.string().trim().optional(),

  badge: z.enum(["NEW", "TRENDING", "LOW_STOCK", "CLEARANCE", "NONE"]),

  retailPrice: optionalMoney,
  compareAtPrice: optionalMoney,
  priceMin: optionalMoney,
  priceMax: optionalMoney,

  stockStatus: z.enum([
    "IN_STOCK",
    "LOW_STOCK",
    "MADE_TO_ORDER",
    "OUT_OF_STOCK",
  ]),
  isQuoteOnly: z.boolean(),

  overview: z.array(z.string()),
  highlights: z.array(z.string()),
  sections: z.array(sectionSchema),
  specs: z.array(specRowSchema),
  documents: z.array(documentSchema),
  shipping: z.array(z.string()),

  leadTimeDays: z.coerce.number().int().positive("Must be at least 1 day."),
  warrantyMonths: z.coerce.number().int().nonnegative(),
});

/** The validated, coerced shape — what the action functions receive after zodResolver parses the form. */
export type ProductInput = z.infer<typeof productSchema>;
/** The raw form shape — what useForm<> actually holds before validation (z.coerce fields are looser here). */
export type ProductFormValues = z.input<typeof productSchema>;

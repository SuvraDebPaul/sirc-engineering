import { z } from "zod";

export const testimonialSchema = z.object({
  headline: z.string().trim().min(2, "Headline is required.").max(120, "That headline is too long."),
  quote: z.string().trim().min(10, "Please add the quote."),
  authorName: z.string().trim().min(2, "Author name is required.").max(80, "That name is too long."),
  authorRole: z.string().trim().min(2, "Author role is required.").max(80, "That role is too long."),
  company: z.string().trim().min(2, "Company is required.").max(80, "That company name is too long."),
  sortOrder: z.coerce.number().int().default(0),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
/** `useForm()`'s first generic — `sortOrder` is optional pre-coercion because of `.default()`. */
export type TestimonialFormValues = z.input<typeof testimonialSchema>;

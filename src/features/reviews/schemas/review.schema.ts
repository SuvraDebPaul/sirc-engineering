import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce
    .number()
    .int()
    .min(1, "Choose a star rating.")
    .max(5, "Choose a star rating."),
  title: z
    .string()
    .trim()
    .min(3, "Give your review a short title.")
    .max(120, "Keep the title under 120 characters."),
  body: z
    .string()
    .trim()
    .min(10, "Say a bit more — at least 10 characters.")
    .max(2000, "Keep your review under 2,000 characters."),
});

/** The schema's output type — what every consumer of a submitted review works with. */
export type ReviewInput = z.infer<typeof reviewSchema>;

/** The schema's input type — what `useForm()` needs before `rating` is coerced to a number. */
export type ReviewFormValues = z.input<typeof reviewSchema>;

import { z } from "zod";

const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("p"), text: z.string().trim().min(1, "Text is required.") }),
  z.object({ type: z.literal("h2"), text: z.string().trim().min(1, "Text is required.") }),
  z.object({ type: z.literal("quote"), text: z.string().trim().min(1, "Text is required.") }),
  z.object({
    type: z.literal("ul"),
    items: z.array(z.string().trim().min(1)).min(1, "Add at least one bullet."),
  }),
]);

export const blogPostSchema = z.object({
  title: z.string().trim().min(2, "Title is required.").max(200, "That title is too long."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(200, "That slug is too long.")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only."),
  excerpt: z.string().trim().min(10, "Please add a short excerpt.").max(400, "Keep the excerpt under 400 characters."),
  category: z.string().trim().min(1, "Category is required."),
  author: z.string().trim().min(1, "Author is required."),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.string().min(1, "Choose a publish date."),
  /** Comma-separated in the form, split into an array before validation runs on the server. */
  tags: z.array(z.string().trim().min(1)),
  blocks: z.array(blockSchema).min(1, "Add at least one block of content."),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type PostBlockInput = z.infer<typeof blockSchema>;

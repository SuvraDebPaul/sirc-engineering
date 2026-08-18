import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Please tell us your name.")
      .max(100, "That name is too long."),
    email: z
      .email("Enter a valid email address.")
      .max(200, "That email address is too long."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(52, "Password is too long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // without this, the error lands as a generic form error instead
  });

export type RegisterInput = z.infer<typeof registerSchema>;

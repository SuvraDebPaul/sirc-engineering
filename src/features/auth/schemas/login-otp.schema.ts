import { z } from "zod";

export const requestLoginOtpSchema = z.object({
  email: z.email("Enter a valid email address."),
});
export type RequestLoginOtpInput = z.infer<typeof requestLoginOtpSchema>;

export const verifyLoginOtpSchema = z.object({
  email: z.email(),
  otp: z.string().length(6, "Enter the 6-digit code."),
});
export type VerifyLoginOtpInput = z.infer<typeof verifyLoginOtpSchema>;

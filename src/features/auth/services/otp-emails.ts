type OTPType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";

const COPY: Record<
  OTPType,
  { subject: string; heading: string; body: string }
> = {
  "email-verification": {
    subject: "Verify your email — SIRC",
    heading: "Confirm your email address",
    body: "Enter this code to verify your email and finish setting up your account.",
  },
  "forget-password": {
    subject: "Reset your password — SIRC",
    heading: "Reset your password",
    body: "Enter this code to choose a new password. If you didn't request this, you can ignore this email.",
  },
  "sign-in": {
    subject: "Your sign-in code — SIRC",
    heading: "Sign in to SIRC",
    body: "Enter this code to sign in.",
  },
  "change-email": {
    subject: "Confirm your new email — SIRC",
    heading: "Confirm your new email address",
    body: "Enter this code to confirm your new email address.",
  },
};

export function otpEmailContent(
  type: OTPType,
  otp: string,
): { subject: string; html: string } {
  const { subject, heading, body } = COPY[type];

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 18px; margin: 0 0 12px;">${heading}</h1>
      <p style="color: #555; font-size: 14px; line-height: 1.5;">${body}</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; margin: 32px 0; padding: 16px; background: #f4f4f5; border-radius: 8px;">${otp}</p>
      <p style="color: #999; font-size: 12px;">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>
    </div>
  `;
  return { subject, html };
}

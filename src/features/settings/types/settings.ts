export interface SocialLink {
  label: string;
  href: string;
  /** Key into `SocialIcon`'s known glyphs — see `components/shared/social-icon.tsx`. */
  icon: string;
}

export interface SiteSettingsData {
  name: string;
  shortDescription: string;
  description: string;
  logoUrl: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  socialLinks: SocialLink[];
}

export type FieldErrors = Partial<Record<keyof SiteSettingsData | "form", string>>;

export interface SettingsFormState {
  status: "idle" | "error" | "success";
  errors: FieldErrors;
}

export const emptySettingsState: SettingsFormState = { status: "idle", errors: {} };

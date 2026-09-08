import { cache } from "react";
import { unstable_cache } from "next/cache";

import { CACHE_DURATION_SECONDS, CACHE_TAGS } from "@/lib/cache";
import { prisma } from "@/lib/db/prisma";
import { siteConfig, contactInfo, socialLinks as defaultSocialLinks } from "@/config/site";
import { SOCIAL_ICON_NAMES } from "@/components/shared/social-icon";

import type { FieldErrors, SiteSettingsData, SocialLink } from "@/features/settings/types/settings";

const SETTINGS_ID = "singleton";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_ALLOWED = /^[\d\s+()-]+$/;

const read = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

function parseSocialLinks(raw: string): SocialLink[] | null {
  if (raw === "") return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const links: SocialLink[] = [];
    for (const entry of parsed) {
      if (typeof entry !== "object" || entry === null) return null;
      const { label, href, icon } = entry as Record<string, unknown>;
      if (typeof label !== "string" || typeof href !== "string" || typeof icon !== "string") {
        return null;
      }
      if (label.trim() === "" || href.trim() === "") continue;
      links.push({ label: label.trim(), href: href.trim(), icon });
    }
    return links;
  } catch {
    return null;
  }
}

export type SettingsValidationResult =
  | { ok: true; data: Omit<SiteSettingsData, "logoUrl"> }
  | { ok: false; errors: FieldErrors };

/**
 * Validation is hand-written for the same reason as everywhere else in this
 * app: a form this size is not worth a schema-library dependency. See
 * `features/enquiries/services/rfq.ts` for the original rationale.
 *
 * `logoUrl` is deliberately excluded — the action decides that separately,
 * since it depends on whether a new file was actually uploaded.
 */
export function validateSettingsForm(formData: FormData): SettingsValidationResult {
  const errors: FieldErrors = {};

  const name = read(formData, "name");
  const shortDescription = read(formData, "shortDescription");
  const description = read(formData, "description");
  const phone = read(formData, "phone");
  const whatsapp = read(formData, "whatsapp");
  const email = read(formData, "email");
  const address = read(formData, "address");
  const hours = read(formData, "hours");

  if (name.length < 2) errors.name = "Site name is required.";
  if (shortDescription.length < 2) errors.shortDescription = "This is shown in page titles — please fill it in.";
  if (description.length < 2) errors.description = "This is used for search engines and social previews.";

  if (email === "") errors.email = "An email address is required.";
  else if (!EMAIL.test(email)) errors.email = "That does not look like an email address.";

  if (phone === "") {
    errors.phone = "A phone number is required.";
  } else if (!PHONE_ALLOWED.test(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  const whatsappDigits = whatsapp.replace(/\D/g, "");
  if (whatsapp === "") {
    errors.whatsapp = "A WhatsApp number is required.";
  } else if (whatsappDigits !== whatsapp || whatsappDigits.length < 9 || whatsappDigits.length > 15) {
    errors.whatsapp = "Digits only, international format, no spaces or plus sign (e.g. 8801XXXXXXXXX).";
  }

  if (address.length < 2) errors.address = "An address is required.";
  if (hours.length < 2) errors.hours = "Business hours are required.";

  const socialLinks = parseSocialLinks(read(formData, "socialLinks"));
  if (socialLinks === null) {
    errors.form = "Something went wrong with the social links list — please try again.";
  } else {
    for (const link of socialLinks) {
      if (!SOCIAL_ICON_NAMES.includes(link.icon as (typeof SOCIAL_ICON_NAMES)[number])) {
        errors.form = `Unknown social icon "${link.icon}".`;
        break;
      }
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name,
      shortDescription,
      description,
      phone,
      whatsapp,
      email,
      address,
      hours,
      socialLinks: socialLinks!,
    },
  };
}

function toSiteSettingsData(row: {
  name: string;
  shortDescription: string;
  description: string;
  logoUrl: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  socialLinks: unknown;
}): SiteSettingsData {
  return {
    name: row.name,
    shortDescription: row.shortDescription,
    description: row.description,
    logoUrl: row.logoUrl,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    address: row.address,
    hours: row.hours,
    socialLinks: Array.isArray(row.socialLinks) ? (row.socialLinks as SocialLink[]) : [],
  };
}

/**
 * What the site shows before an admin has ever opened the settings form.
 *
 * Previously the read path created this row with an `upsert`. That meant a
 * write transaction on literally every request to every page, forever, to
 * seed a row exactly once — the single most expensive thing this app did.
 * Falling back to the same values in memory is indistinguishable to a
 * visitor, and `saveSiteSettings` below still upserts, so the row appears
 * the first time an admin saves.
 */
const DEFAULT_SETTINGS: SiteSettingsData = {
  name: siteConfig.name,
  shortDescription: siteConfig.shortDescription,
  description: siteConfig.description,
  logoUrl: null,
  phone: contactInfo.phone,
  whatsapp: contactInfo.whatsapp,
  email: contactInfo.email,
  address: contactInfo.address,
  hours: contactInfo.hours,
  socialLinks: defaultSocialLinks as unknown as SocialLink[],
};

const readSiteSettings = unstable_cache(
  async (): Promise<SiteSettingsData> => {
    const row = await prisma.siteSettings.findUnique({ where: { id: SETTINGS_ID } });
    return row ? toSiteSettingsData(row) : DEFAULT_SETTINGS;
  },
  ["site-settings"],
  { tags: [CACHE_TAGS.settings], revalidate: CACHE_DURATION_SECONDS },
);

/**
 * Read the sitewide settings.
 *
 * Two layers, doing different jobs: `unstable_cache` keeps the row out of the
 * database across requests (it is read by the root layout's metadata, the
 * header, the footer and the contact page — on every page of the site), and
 * React's `cache()` collapses those four call sites into one within a single
 * render. `saveSiteSettings` invalidates the tag, so an admin edit is live on
 * the next request rather than after a timeout.
 */
export const getSiteSettings = cache((): Promise<SiteSettingsData> => readSiteSettings());

export async function saveSiteSettings(data: SiteSettingsData): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data, socialLinks: data.socialLinks as unknown as object },
    update: { ...data, socialLinks: data.socialLinks as unknown as object },
  });
}

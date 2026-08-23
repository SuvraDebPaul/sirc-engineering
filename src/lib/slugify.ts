/**
 * Turns a name into a URL-safe slug: lowercase, accents stripped, anything
 * that isn't a letter/number/hyphen becomes a hyphen, runs of hyphens
 * collapse to one.
 *
 * "Electrical Tools & Meters" -> "electrical-tools-meters"
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

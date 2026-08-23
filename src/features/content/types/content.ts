/**
 * Marketing content types — the promotional furniture of the home page.
 * Separate from the commerce domain (product, category, brand) because it is
 * edited by different people for different reasons.
 */
export type PromoTone = "dark" | "amber" | "slate" | "brand";

export interface Promotion {
  id: string;
  /** Small line above the headline, e.g. "Up to 30% off". */
  eyebrow: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  href: string;
  imageUrl: string;
  tone: PromoTone;
}

export interface Feature {
  id: string;
  /** Icon name from `lib/icons`. */
  icon: string;
  title: string;
  description: string;
}

export interface ServiceHighlight {
  id: string;
  icon: string;
  /** Card photograph; the icon badge sits on top of it. */
  imageUrl: string;
  title: string;
  description: string;
  href: string;
  turnaroundDays: number;
  onSite: boolean;
}

export interface Testimonial {
  id: string;
  /** Short bold summary shown above the quote. */
  headline: string;
  quote: string;
  authorName: string;
  authorRole: string;
  company: string;
  /** Optional headshot. Empty renders monogram initials instead. */
  imageUrl?: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  readMinutes: number;
  /** Free-form topic tags, used by the blog sidebar and the post footer. */
  tags: string[];
}

/**
 * One block of an article body.
 *
 * Structured blocks rather than an HTML string — no markdown parser, no
 * `dangerouslySetInnerHTML`, and nothing an editor could paste that would end
 * up executing.
 */
export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export interface ImageCredit {
  id: string;
  file: string;
  title: string;
  author: string;
  licence: string;
  source: string;
}

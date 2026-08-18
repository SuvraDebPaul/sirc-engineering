/**
 * Product detail types.
 *
 * Deliberately separate from `Product`. A listing renders twenty cards and
 * needs none of this — dragging spec tables and review threads into the card
 * type would mean every grid paid for data it never draws. The detail page is
 * the only consumer, so it is the only thing that loads it.
 */

export interface ProductImage {
  url: string;
  /** Describes what the shot actually shows; used as the alt text. */
  caption: string;
}

export interface SpecRow {
  label: string;
  value: string;
}

/** One of the titled blocks in the description tab. */
export interface ProductSection {
  title: string;
  body: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  /** ISO date. */
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

/**
 * A downloadable document — datasheet, manual, declaration of conformity.
 *
 * `url` is nullable on purpose. We know which documents *exist* for an
 * instrument long before they are hosted, and a listed-but-unhosted document
 * is more useful than an absent one: it tells the buyer the datasheet exists
 * and gives them a way to ask for it, which is a lead rather than a dead end.
 */
export interface ProductDocument {
  title: string;
  kind: "datasheet" | "manual" | "certificate" | "declaration";
  /** Null until the file is hosted — the UI switches to "request" mode. */
  url: string | null;
  /** Shown beside the link so nobody downloads 40 MB on mobile data. */
  sizeLabel?: string;
}

export interface ProductDetail {
  slug: string;
  images: ProductImage[];
  /** Long-form copy for the description tab, one string per paragraph. */
  overview: string[];
  highlights: string[];
  sections: ProductSection[];
  specs: SpecRow[];
  documents: ProductDocument[];
  shipping: string[];
  reviews: ProductReview[];
  /** Working days from order to dispatch. */
  leadTimeDays: number;
  warrantyMonths: number;
}

/** A product with its detail record attached, as the detail page needs it. */
export interface ProductWithDetail {
  product: import("./product").Product;
  detail: ProductDetail;
}

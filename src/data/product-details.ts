import type { Product } from "@/features/catalog/types/product";
import type { ProductDetail, ProductImage, ProductReview } from "@/features/catalog/types/product-detail";

import { PRODUCTS } from "./products";

/**
 * Demo product detail records.
 *
 * ⚠️ Placeholder content. Before launch, three things here must be replaced
 * with material from the business:
 *
 *  1. **Gallery images.** Each product has exactly one real photograph. The
 *     remaining frames are captioned laboratory photos, not alternate views of
 *     the instrument — they are honest about what they show, but they are not
 *     product photography.
 *  2. **Reviews.** These are written examples, not real customer feedback.
 *     Publishing invented reviews as genuine is illegal in a number of the
 *     markets this site will be read from. They are attributed by role and
 *     city rather than by name so that no fictitious person is being quoted.
 *  3. **Specifications.** Every row below is derived from data we actually
 *     hold — brand, model, warranty, lead time, what we supply with it. No
 *     physical specification (weight, dimensions, accuracy, range) is invented,
 *     because guessing at the accuracy class of a real Fluke or Megger
 *     instrument would be worse than leaving it out. The manufacturer's
 *     datasheet figures should be loaded in when available.
 *
 * Details are generated from each product rather than hand-written twenty
 * times over, so the copy cannot drift out of step with the catalogue.
 */

/** Working days from order to dispatch, by availability. */
const LEAD_TIME_DAYS: Record<Product["stockStatus"], number> = {
  IN_STOCK: 2,
  LOW_STOCK: 3,
  MADE_TO_ORDER: 21,
  OUT_OF_STOCK: 28,
};

const WARRANTY_MONTHS = 24;

/**
 * Frames shown after the product's own photograph.
 *
 * Captioned as what they are. A shopper clicking through the strip sees the
 * laboratory the instrument is calibrated in, not a second angle on the
 * instrument that we do not have.
 */
const CONTEXT_IMAGES: ProductImage[] = [
  { url: "/images/catalog/svc-calibration.jpg", caption: "Our calibration laboratory" },
  { url: "/images/catalog/svc-testing.jpg", caption: "Acceptance testing before dispatch" },
  { url: "/images/catalog/svc-inspection.jpg", caption: "On-site inspection and commissioning" },
];

const buildImages = (product: Product): ProductImage[] => {
  const own = product.imageUrl
    ? [{ url: product.imageUrl, caption: `${product.brand} ${product.modelNumber}` }]
    : [];
  return [...own, ...CONTEXT_IMAGES];
};

const buildSpecs = (product: Product, leadTimeDays: number) => {
  const rows = [
    { label: "Brand", value: product.brand },
    { label: "Model number", value: product.modelNumber },
    { label: "Item code", value: product.id.toUpperCase() },
    { label: "Category", value: product.categoryName },
  ];

  if (product.subCategoryName) {
    rows.push({ label: "Sub-category", value: product.subCategoryName });
  }

  return [
    ...rows,
    { label: "Warranty", value: `${WARRANTY_MONTHS} months` },
    { label: "Calibration certificate", value: "Traceable certificate supplied" },
    { label: "Recommended recalibration", value: "Every 12 months" },
    { label: "Lead time", value: `${leadTimeDays} working days` },
    { label: "Service and spares", value: "Supported locally in Bangladesh" },
  ];
};

/**
 * Written examples, attributed by role rather than by name.
 *
 * The count on the card comes from `product.reviewCount`; these are the two
 * that get rendered. Ratings straddle the product's average so the summary and
 * the written reviews cannot contradict each other.
 */
const buildReviews = (product: Product): ProductReview[] => {
  if (product.rating === null || product.reviewCount === 0) return [];

  const high = Math.min(5, Math.round(product.rating + 0.3));
  const low = Math.max(1, Math.floor(product.rating));

  return [
    {
      id: `${product.id}-r1`,
      author: "Maintenance engineer, Chattogram",
      rating: high,
      date: "2026-05-18",
      title: "Certificate arrived with the instrument",
      body: `Ordered the ${product.modelNumber} for our shutdown. It shipped with the calibration certificate in the box, which is the part that usually holds us up at audit. Straightforward to commission.`,
      verified: true,
    },
    {
      id: `${product.id}-r2`,
      author: "QA manager, Gazipur",
      rating: low,
      date: "2026-03-02",
      title: "Does the job, delivery took a few days",
      body: `No complaints about the instrument itself — it reads consistently against our reference. Delivery ran slightly past the estimate, though we were kept informed.`,
      verified: true,
    },
  ];
};

const buildDetail = (product: Product): ProductDetail => {
  const leadTimeDays = LEAD_TIME_DAYS[product.stockStatus];

  return {
    slug: product.slug,
    images: buildImages(product),
    overview: [
      product.description,
      `Supplied by SIRC with a traceable calibration certificate, a ${WARRANTY_MONTHS}-month warranty and local service. Every instrument is function-checked and certified in our own laboratory before it is dispatched, so it arrives ready to present at audit rather than needing a certificate chased afterwards.`,
      `Need it configured a particular way, or as part of a larger package? Send us the specification and we will quote against it — including recalibration on a schedule that matches your maintenance windows.`,
    ],
    highlights: [
      "Traceable calibration certificate supplied with every unit",
      `${WARRANTY_MONTHS}-month warranty, serviced locally in Bangladesh`,
      `Dispatch in ${leadTimeDays} working days`,
      "Operator training and on-site commissioning available",
    ],
    sections: [
      {
        title: "Calibration certificate included",
        body: "Every instrument leaves our laboratory with as-found and as-left values, the stated measurement uncertainty and an unbroken traceability chain back to national standards.",
      },
      {
        title: "On-site commissioning",
        body: "Our engineers will install and verify the instrument on your plant, and confirm it reads correctly against a reference under your own operating conditions.",
      },
      {
        title: "Operator training",
        body: "Half-day and full-day sessions covering safe operation, correct measurement technique and how to read the results the instrument gives you.",
      },
      {
        title: "Recalibration reminders",
        body: "We track the due date and contact you before the certificate lapses, so equipment is never found out of calibration during an audit.",
      },
    ],
    specs: buildSpecs(product, leadTimeDays),
    // Every instrument has a manufacturer datasheet and manual; none are
    // hosted yet, so all three carry a null url and the panel offers to send
    // them. Drop a real path in and the same panel becomes a download.
    documents: [
      { title: `${product.brand} ${product.modelNumber} datasheet`, kind: "datasheet", url: null },
      { title: "User manual", kind: "manual", url: null },
      { title: "Sample calibration certificate", kind: "certificate", url: null },
    ],
    shipping: [
      `Dispatched within ${leadTimeDays} working days of a confirmed order.`,
      "Delivered nationwide. Dhaka and Chattogram metro typically next day after dispatch; other districts 2–4 days.",
      "Inspect on delivery. Report transit damage within 48 hours and we will replace the unit.",
      "Returns accepted within 7 days on unused stock in original packaging. Made-to-order and configured instruments are non-returnable.",
      "Calibration certificates are reissued free of charge if lost within the certificate's validity period.",
    ],
    reviews: buildReviews(product),
    leadTimeDays,
    warrantyMonths: WARRANTY_MONTHS,
  };
};

export const PRODUCT_DETAILS: ProductDetail[] = PRODUCTS.map(buildDetail);

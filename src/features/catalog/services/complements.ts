import type { Product } from "@/features/catalog/types";

import { getProducts } from "./products";

/**
 * Complementary instruments — "often specified together".
 *
 * Not "frequently bought together": that claim requires order history, and
 * there is none. This is a curated map of category pairs that genuinely serve
 * the same job — an insulation tester and an earth resistance tester are both
 * on the electrical commissioning sheet, a pressure calibrator and a
 * temperature calibrator are both in the loop technician's case.
 *
 * Cross-selling accessories is where the margin is in instrument retail. When
 * consumables and accessories are added to the catalogue as real products,
 * this map is replaced by explicit per-product accessory ids — the component
 * consuming it does not change.
 */
const COMPLEMENTS: Record<string, string[]> = {
  "Insulation Resistance & Battery": ["Fault Testing", "Electrical Tools"],
  "Fault Testing": ["Insulation Resistance & Battery", "Electrical Tools"],
  "Electrical Tools": ["Insulation Resistance & Battery", "Energy"],
  Energy: ["Electrical Tools", "Fault Testing"],
  Calibration: ["Temperature", "Measuring & Marking Tools"],
  Temperature: ["Calibration", "Industrial Safety"],
  "Industrial Safety": ["Temperature", "Electrical Tools"],
  "Measuring & Marking Tools": ["Calibration", "Electrical Tools"],
};

/**
 * Instruments that pair with this one.
 *
 * Excludes the product itself and anything already in its own category — a
 * "works with" strip full of near-identical meters is a listing page, not a
 * recommendation.
 */
export const complementaryProducts = async (product: Product, limit = 4): Promise<Product[]> => {
  const wanted = COMPLEMENTS[product.categoryName] ?? [];
  if (wanted.length === 0) return [];

  const products = await getProducts();
  const ranked = wanted.flatMap((category) =>
    products.filter(
      (candidate) => candidate.id !== product.id && candidate.categoryName === category,
    ),
  );

  // In-stock first: recommending a 21-day made-to-order item alongside
  // something on the shelf slows the whole order down.
  return ranked
    .sort((a, b) => Number(a.stockStatus !== "IN_STOCK") - Number(b.stockStatus !== "IN_STOCK"))
    .slice(0, limit);
};

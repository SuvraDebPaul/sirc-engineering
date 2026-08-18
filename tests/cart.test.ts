import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  DELIVERY_OPTIONS,
  FREE_DELIVERY_THRESHOLD,
  cartCount,
  cartSubtotal,
  cartUnitPrice,
  deliveryCost,
  isAddable,
  resolveLines,
} from "@/lib/cart";
import type { Product } from "@/types";

/**
 * Cart arithmetic.
 *
 * This is the highest-consequence code in the application: a defect here does
 * not produce a visual glitch, it produces a wrong invoice sent to a customer.
 * Money is held as integer poisha precisely so these sums are exact, and these
 * tests exist to keep them that way.
 */
const product = (over: Partial<Product> = {}): Product => ({
  id: "p1",
  name: "Test instrument",
  slug: "test-instrument",
  description: "",
  brand: "Fluke",
  modelNumber: "T1",
  imageUrl: null,
  categoryName: "Temperature",
  categoryIcon: "Thermometer",
  subCategoryName: null,
  badge: null,
  retailPrice: 100_000,
  compareAtPrice: null,
  tierPrice: null,
  priceMin: null,
  priceMax: null,
  stockStatus: "IN_STOCK",
  isQuoteOnly: false,
  rating: null,
  reviewCount: 0,
  ...over,
});

describe("cartUnitPrice", () => {
  test("returns the retail price for a normal product", () => {
    assert.equal(cartUnitPrice(product()), 100_000);
  });

  test("refuses quote-only products", () => {
    assert.equal(cartUnitPrice(product({ isQuoteOnly: true })), null);
  });

  test("refuses range-priced products — there is no single figure to charge", () => {
    assert.equal(cartUnitPrice(product({ priceMin: 100_000, priceMax: 200_000 })), null);
  });

  test("refuses a product with no price at all", () => {
    assert.equal(cartUnitPrice(product({ retailPrice: null })), null);
  });
});

describe("isAddable", () => {
  test("in-stock priced product is addable", () => {
    assert.equal(isAddable(product()), true);
  });

  test("out of stock is not addable even when priced", () => {
    assert.equal(isAddable(product({ stockStatus: "OUT_OF_STOCK" })), false);
  });

  test("made-to-order is addable — it has a price and a lead time", () => {
    assert.equal(isAddable(product({ stockStatus: "MADE_TO_ORDER" })), true);
  });
});

describe("resolveLines", () => {
  const catalogue = [
    product({ id: "a", retailPrice: 100_000 }),
    product({ id: "b", retailPrice: 250_000 }),
    product({ id: "q", isQuoteOnly: true }),
  ];

  test("joins stored lines to live catalogue prices", () => {
    const lines = resolveLines([{ productId: "a", quantity: 3 }], catalogue);
    assert.equal(lines.length, 1);
    assert.equal(lines[0]!.unitPrice, 100_000);
    assert.equal(lines[0]!.lineTotal, 300_000);
  });

  test("drops a line whose product no longer exists", () => {
    const lines = resolveLines([{ productId: "gone", quantity: 1 }], catalogue);
    assert.deepEqual(lines, []);
  });

  test("drops a line that became quote-only — it cannot be charged for", () => {
    const lines = resolveLines([{ productId: "q", quantity: 1 }], catalogue);
    assert.deepEqual(lines, []);
  });

  test("uses the current price, not any stored one", () => {
    // The stored line carries only an id and a quantity, so a price change in
    // the catalogue is picked up on the next render. This is the whole reason
    // prices are not persisted with the cart.
    const repriced = [product({ id: "a", retailPrice: 111_111 })];
    const lines = resolveLines([{ productId: "a", quantity: 2 }], repriced);
    assert.equal(lines[0]!.lineTotal, 222_222);
  });
});

describe("cartSubtotal and cartCount", () => {
  const catalogue = [
    product({ id: "a", retailPrice: 42_599 }),
    product({ id: "b", retailPrice: 7_101 }),
  ];

  test("subtotal sums line totals exactly", () => {
    const lines = resolveLines(
      [
        { productId: "a", quantity: 3 },
        { productId: "b", quantity: 7 },
      ],
      catalogue,
    );
    // 42599*3 + 7101*7 = 127797 + 49707 = 177504
    assert.equal(cartSubtotal(lines), 177_504);
  });

  test("integer arithmetic leaves no floating-point residue", () => {
    const lines = resolveLines([{ productId: "a", quantity: 3 }], catalogue);
    const total = cartSubtotal(lines);
    assert.equal(Number.isInteger(total), true);
    assert.equal(total, Math.round(total));
  });

  test("count sums quantities, not lines", () => {
    assert.equal(
      cartCount([
        { productId: "a", quantity: 3 },
        { productId: "b", quantity: 7 },
      ]),
      10,
    );
  });

  test("empty cart totals zero, not NaN", () => {
    assert.equal(cartSubtotal([]), 0);
    assert.equal(cartCount([]), 0);
  });
});

describe("deliveryCost", () => {
  const under = FREE_DELIVERY_THRESHOLD - 1;

  test("charges the standard rate below the threshold", () => {
    assert.equal(deliveryCost("standard", under), 60_000);
  });

  test("is free exactly at the threshold, not one poisha above it", () => {
    // Off-by-one here is a customer who was promised free delivery and
    // charged for it, which is the version of this bug that generates
    // complaints rather than lost margin.
    assert.equal(deliveryCost("standard", FREE_DELIVERY_THRESHOLD), 0);
    assert.equal(deliveryCost("standard", under), 60_000);
  });

  test("express is also free above the threshold", () => {
    assert.equal(deliveryCost("express", FREE_DELIVERY_THRESHOLD + 1), 0);
    assert.equal(deliveryCost("express", under), 150_000);
  });

  test("collection is always free, whatever the subtotal", () => {
    assert.equal(deliveryCost("pickup", 0), 0);
    assert.equal(deliveryCost("pickup", under), 0);
  });

  test("an unknown option falls back to standard rather than free", () => {
    // Defaulting an unrecognised delivery method to zero would let a crafted
    // request post free shipping.
    assert.equal(deliveryCost("nonsense" as never, under), 60_000);
  });

  test("every declared option has a non-negative cost", () => {
    for (const option of DELIVERY_OPTIONS) {
      assert.ok(option.cost >= 0, `${option.value} has a negative cost`);
    }
  });
});

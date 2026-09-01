import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { discountPercent, resolvePriceDisplay } from "@/features/catalog/services/product";
import { validateQuoteRequest } from "@/features/enquiries/services/rfq";
import { PAYMENT_METHODS, validateCheckout } from "@/features/cart/services/checkout";
import type { Product } from "@/features/catalog/types";

/**
 * Pricing display rules and the server-side validators.
 *
 * The validators are the only thing standing between a crafted POST and the
 * sales desk, since client-side `required` attributes are a convenience a
 * direct request ignores entirely. These tests exercise them the way an
 * attacker would: by not using the form.
 */
const product = (over: Partial<Product> = {}): Product => ({
  id: "p1",
  name: "Instrument",
  slug: "instrument",
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

describe("resolvePriceDisplay", () => {
  test("quote-only wins over every other rule", () => {
    const price = resolvePriceDisplay(
      product({ isQuoteOnly: true, retailPrice: 100_000, priceMin: 1, priceMax: 2 }),
      "B2B",
    );
    assert.equal(price.kind, "quote");
  });

  test("a variant range beats a single retail price", () => {
    const price = resolvePriceDisplay(product({ priceMin: 100, priceMax: 200 }), "GUEST");
    assert.equal(price.kind, "range");
  });

  test("contract pricing applies only to a B2B tier", () => {
    const item = product({ tierPrice: 80_000 });
    assert.equal(resolvePriceDisplay(item, "B2B").kind, "price");
    assert.equal((resolvePriceDisplay(item, "B2B") as { amount: number }).amount, 80_000);
    // A guest must never be shown the negotiated price.
    assert.equal((resolvePriceDisplay(item, "GUEST") as { amount: number }).amount, 100_000);
  });

  test("no price at all falls through to quote, never to zero", () => {
    assert.equal(resolvePriceDisplay(product({ retailPrice: null }), "GUEST").kind, "quote");
  });

  test("a compare-at below the live price is ignored, not shown as a saving", () => {
    const price = resolvePriceDisplay(
      product({ retailPrice: 100_000, compareAtPrice: 90_000 }),
      "GUEST",
    );
    assert.equal((price as { compareAt: number | null }).compareAt, null);
  });
});

describe("discountPercent", () => {
  test("computes a genuine saving", () => {
    assert.equal(discountPercent(product({ retailPrice: 75_000, compareAtPrice: 100_000 })), 25);
  });

  test("returns null when there is nothing to advertise", () => {
    assert.equal(discountPercent(product({ compareAtPrice: null })), null);
    assert.equal(discountPercent(product({ retailPrice: 100_000, compareAtPrice: 100_000 })), null);
    assert.equal(discountPercent(product({ retailPrice: 100_000, compareAtPrice: 90_000 })), null);
  });

  test("never renders a meaningless -0%", () => {
    // A saving that rounds to zero is not a saving.
    assert.equal(discountPercent(product({ retailPrice: 99_999, compareAtPrice: 100_000 })), null);
  });
});

const quoteForm = (over: Record<string, string> = {}) => {
  const data = new FormData();
  const base: Record<string, string> = {
    enquiryType: "purchase",
    name: "Rahim Uddin",
    email: "rahim@example.com",
    phone: "+880 1712 345678",
    message: "We need three insulation testers for a November shutdown.",
    consent: "on",
    ...over,
  };
  for (const [k, v] of Object.entries(base)) if (v !== "") data.set(k, v);
  return data;
};

describe("validateQuoteRequest", () => {
  test("accepts a complete request", () => {
    assert.equal(validateQuoteRequest(quoteForm()).ok, true);
  });

  test("phone is mandatory", () => {
    const result = validateQuoteRequest(quoteForm({ phone: "" }));
    assert.equal(result.ok, false);
    assert.ok(!result.ok && result.errors.phone);
  });

  test("a present but malformed phone is still rejected", () => {
    // A number that looks reachable but is not is worse than none.
    assert.equal(validateQuoteRequest(quoteForm({ phone: "123" })).ok, false);
  });

  test("consent cannot be skipped by omitting the field", () => {
    const result = validateQuoteRequest(quoteForm({ consent: "" }));
    assert.equal(result.ok, false);
    assert.ok(!result.ok && result.errors.consent);
  });

  test("an unknown enquiry type is rejected, not silently defaulted", () => {
    assert.equal(validateQuoteRequest(quoteForm({ enquiryType: "free-stuff" })).ok, false);
  });

  test("quantity must be a positive whole number", () => {
    assert.equal(validateQuoteRequest(quoteForm({ quantity: "0" })).ok, false);
    assert.equal(validateQuoteRequest(quoteForm({ quantity: "-5" })).ok, false);
    assert.equal(validateQuoteRequest(quoteForm({ quantity: "2.5" })).ok, false);
    assert.equal(validateQuoteRequest(quoteForm({ quantity: "3" })).ok, true);
  });

  test("plus-addressed emails are accepted", () => {
    // Over-strict email patterns turn away real customers.
    assert.equal(validateQuoteRequest(quoteForm({ email: "rahim+quotes@example.co.uk" })).ok, true);
  });

  test("values are trimmed, so whitespace is not a valid name", () => {
    assert.equal(validateQuoteRequest(quoteForm({ name: "   " })).ok, false);
  });
});

const checkoutForm = (over: Record<string, string> = {}) => {
  const data = new FormData();
  const base: Record<string, string> = {
    firstName: "Rahim",
    phone: "+880 1712 345678",
    email: "rahim@example.com",
    address: "House 12, Road 4, Banani",
    city: "Dhaka",
    district: "Dhaka",
    payment: "cash-on-delivery",
    ...over,
  };
  for (const [k, v] of Object.entries(base)) if (v !== "") data.set(k, v);
  return data;
};

describe("validateCheckout", () => {
  test("accepts a complete order", () => {
    assert.equal(validateCheckout(checkoutForm()).ok, true);
  });

  test("a delivery address is required", () => {
    assert.equal(validateCheckout(checkoutForm({ address: "" })).ok, false);
    assert.equal(validateCheckout(checkoutForm({ city: "" })).ok, false);
    assert.equal(validateCheckout(checkoutForm({ district: "" })).ok, false);
  });

  test("an unrecognised payment method is rejected", () => {
    assert.equal(validateCheckout(checkoutForm({ payment: "free" })).ok, false);
  });

  test("every declared payment method is accepted", () => {
    for (const option of PAYMENT_METHODS) {
      assert.equal(validateCheckout(checkoutForm({ payment: option.value })).ok, true, option.value);
    }
  });

  test("no card field is ever read from the form", () => {
    // The guarantee is structural: passing card data must change nothing,
    // because nothing looks for it.
    const withCard = checkoutForm();
    withCard.set("cardNumber", "4111111111111111");
    withCard.set("cvv", "123");

    const result = validateCheckout(withCard);
    assert.equal(result.ok, true);
    assert.equal("cardNumber" in (result.ok ? result.data : {}), false);
    assert.equal("cvv" in (result.ok ? result.data : {}), false);
  });
});

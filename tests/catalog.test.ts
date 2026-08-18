import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  PAGE_SIZE,
  buildFacets,
  catalogHref,
  effectivePrice,
  filterProducts,
  parseCatalogQuery,
  priceBuckets,
  sortProducts,
  toggleValue,
} from "@/lib/catalog";
import { STOCK_LABEL } from "@/lib/product";
import type { Product } from "@/types";

/**
 * Catalogue filtering, sorting and faceting.
 *
 * The facet counts are the subtle part: each group is counted with its *own*
 * filter lifted, which is what stops every unselected brand reading zero the
 * moment one brand is chosen. That behaviour is invisible until it breaks and
 * impossible to notice in review, which is exactly what a test is for.
 */
const product = (over: Partial<Product> = {}): Product => ({
  id: Math.random().toString(36).slice(2),
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

const CATALOGUE: Product[] = [
  product({ id: "1", name: "Alpha", brand: "Fluke", categoryName: "Temperature", retailPrice: 50_000, rating: 4.8 }),
  product({ id: "2", name: "Bravo", brand: "Fluke", categoryName: "Energy", retailPrice: 150_000, rating: 4.2 }),
  product({ id: "3", name: "Charlie", brand: "Megger", categoryName: "Temperature", retailPrice: 900_000, rating: 3.5 }),
  product({ id: "4", name: "Delta", brand: "Megger", categoryName: "Energy", isQuoteOnly: true, retailPrice: null }),
  product({ id: "5", name: "Echo", brand: "Testo", categoryName: "Temperature", priceMin: 200_000, priceMax: 400_000, stockStatus: "OUT_OF_STOCK" }),
];

const query = (over: Partial<ReturnType<typeof parseCatalogQuery>> = {}) => ({
  ...parseCatalogQuery({}),
  ...over,
});

describe("parseCatalogQuery", () => {
  test("defaults are safe when the URL is empty", () => {
    const q = parseCatalogQuery({});
    assert.deepEqual(q.categories, []);
    assert.equal(q.sort, "featured");
    assert.equal(q.view, "grid");
    assert.equal(q.shown, PAGE_SIZE);
  });

  test("accepts a comma-joined multi-select", () => {
    assert.deepEqual(parseCatalogQuery({ brand: "Fluke,Megger" }).brands, ["Fluke", "Megger"]);
  });

  test("accepts repeated params too", () => {
    assert.deepEqual(parseCatalogQuery({ brand: ["Fluke", "Megger"] }).brands, ["Fluke", "Megger"]);
  });

  test("rejects a hand-edited sort rather than rendering nothing", () => {
    assert.equal(parseCatalogQuery({ sort: "cheapest" }).sort, "featured");
  });

  test("rejects an out-of-range rating", () => {
    assert.equal(parseCatalogQuery({ rating: "99" }).rating, null);
    assert.equal(parseCatalogQuery({ rating: "4" }).rating, 4);
  });

  test("rejects an unknown stock status", () => {
    assert.deepEqual(parseCatalogQuery({ stock: "IN_STOCK,MADE_UP" }).stock, ["IN_STOCK"]);
  });

  test("never lets `show` drop below one page", () => {
    assert.equal(parseCatalogQuery({ show: "2" }).shown, PAGE_SIZE);
    assert.equal(parseCatalogQuery({ show: "-40" }).shown, PAGE_SIZE);
    assert.equal(parseCatalogQuery({ show: "24" }).shown, 24);
  });
});

describe("effectivePrice", () => {
  test("a range product is judged on its cheapest variant", () => {
    assert.equal(effectivePrice(product({ priceMin: 200_000, priceMax: 400_000 })), 200_000);
  });

  test("a quote-only product has no price — it is not free", () => {
    assert.equal(effectivePrice(product({ isQuoteOnly: true })), null);
  });
});

describe("filterProducts", () => {
  const buckets = priceBuckets(CATALOGUE);

  test("brand filter", () => {
    const result = filterProducts(CATALOGUE, query({ brands: ["Megger"] }), buckets);
    assert.deepEqual(result.map((p) => p.name).sort(), ["Charlie", "Delta"]);
  });

  test("filters combine as AND, not OR", () => {
    const result = filterProducts(
      CATALOGUE,
      query({ brands: ["Fluke"], categories: ["Energy"] }),
      buckets,
    );
    assert.deepEqual(result.map((p) => p.name), ["Bravo"]);
  });

  test("search matches model number and brand, not just name", () => {
    assert.equal(filterProducts(CATALOGUE, query({ q: "megger" }), buckets).length, 2);
    assert.equal(filterProducts(CATALOGUE, query({ q: "charlie" }), buckets).length, 1);
  });

  test("rating filter is a floor, not an exact match", () => {
    const result = filterProducts(CATALOGUE, query({ rating: 4 }), buckets);
    assert.deepEqual(result.map((p) => p.name).sort(), ["Alpha", "Bravo"]);
  });

  test("a quote-only product is excluded from every price band", () => {
    for (let index = 0; index < buckets.length; index += 1) {
      const result = filterProducts(CATALOGUE, query({ price: index }), buckets);
      assert.equal(result.some((p) => p.name === "Delta"), false, `band ${index} included Delta`);
    }
  });
});

describe("sortProducts", () => {
  test("price ascending puts quote-only last, not first", () => {
    const sorted = sortProducts(CATALOGUE, "price-asc");
    assert.equal(sorted.at(-1)!.name, "Delta");
    assert.equal(sorted[0]!.name, "Alpha");
  });

  test("price descending also puts quote-only last", () => {
    // Unpriced items sink in both directions: they are neither the cheapest
    // nor the most expensive thing in the catalogue.
    assert.equal(sortProducts(CATALOGUE, "price-desc").at(-1)!.name, "Delta");
  });

  test("a range product sorts on its lowest variant", () => {
    const names = sortProducts(CATALOGUE, "price-asc").map((p) => p.name);
    // Echo starts at 200,000 so it sits after Bravo (150,000), before Charlie (900,000).
    assert.ok(names.indexOf("Echo") > names.indexOf("Bravo"));
    assert.ok(names.indexOf("Echo") < names.indexOf("Charlie"));
  });

  test("does not mutate the array it is given", () => {
    const before = CATALOGUE.map((p) => p.name);
    sortProducts(CATALOGUE, "name-asc");
    assert.deepEqual(CATALOGUE.map((p) => p.name), before);
  });
});

describe("buildFacets", () => {
  const buckets = priceBuckets(CATALOGUE);

  test("a group's own filter is lifted when counting it", () => {
    // With Megger selected, the brand facet must still show Fluke's real
    // count — otherwise every unselected brand reads (0) and the sidebar
    // becomes unusable after the first click.
    const facets = buildFacets(CATALOGUE, query({ brands: ["Megger"] }), buckets, STOCK_LABEL);
    const fluke = facets.brands.find((f) => f.value === "Fluke");
    assert.equal(fluke?.count, 2);
  });

  test("other groups are still narrowed by the active filter", () => {
    const facets = buildFacets(CATALOGUE, query({ brands: ["Fluke"] }), buckets, STOCK_LABEL);
    const temperature = facets.categories.find((f) => f.value === "Temperature");
    assert.equal(temperature?.count, 1); // only Alpha is a Fluke Temperature product
  });

  test("active flags reflect the query", () => {
    const facets = buildFacets(CATALOGUE, query({ brands: ["Megger"] }), buckets, STOCK_LABEL);
    assert.equal(facets.brands.find((f) => f.value === "Megger")?.active, true);
    assert.equal(facets.brands.find((f) => f.value === "Fluke")?.active, false);
  });

  test("every catalogue brand stays listed even at zero", () => {
    const facets = buildFacets(CATALOGUE, query({ categories: ["Energy"] }), buckets, STOCK_LABEL);
    assert.equal(facets.brands.length, 3, "a brand vanished from the sidebar");
  });
});

describe("priceBuckets", () => {
  test("bands cover the catalogue's real range", () => {
    const buckets = priceBuckets(CATALOGUE);
    assert.ok(buckets.length > 0);
    assert.equal(buckets[0]!.min, 0);
    assert.equal(buckets.at(-1)!.max, Infinity, "top band must be open-ended");
  });

  test("bands are contiguous with no gap between them", () => {
    const buckets = priceBuckets(CATALOGUE);
    for (let i = 1; i < buckets.length; i += 1) {
      assert.equal(buckets[i]!.min, buckets[i - 1]!.max, `gap before band ${i}`);
    }
  });

  test("an empty catalogue produces no bands rather than throwing", () => {
    assert.deepEqual(priceBuckets([]), []);
  });
});

describe("catalogHref", () => {
  test("keeps the listing on its own base path", () => {
    assert.equal(
      catalogHref({ brand: "Fluke" }, { view: "list" }, "/category/temperature"),
      "/category/temperature?brand=Fluke&view=list",
    );
  });

  test("null removes a param", () => {
    assert.equal(catalogHref({ brand: "Fluke" }, { brand: null }), "/products");
  });

  test("changing a filter resets paging", () => {
    // Carrying "load more" across a narrowing would render results the
    // shopper never asked to expand.
    assert.equal(catalogHref({ show: "36" }, { brand: "Fluke" }), "/products?brand=Fluke");
  });

  test("paging itself is preserved when explicitly passed", () => {
    assert.equal(catalogHref({}, { show: "24" }), "/products?show=24");
  });
});

describe("toggleValue", () => {
  test("adds, removes, and collapses to null when empty", () => {
    assert.equal(toggleValue([], "a"), "a");
    assert.equal(toggleValue(["a"], "b"), "a,b");
    assert.equal(toggleValue(["a", "b"], "a"), "b");
    assert.equal(toggleValue(["a"], "a"), null);
  });
});

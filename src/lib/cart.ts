import type { Product } from "@/types";

/**
 * Cart and wishlist storage.
 *
 * Both live in `localStorage`, not on the server. There is no account system —
 * pricing is public and customers do not sign in — so there is no user to hang
 * a server-side basket on. `localStorage` survives a refresh and a closed tab,
 * which is the behaviour a basket needs, and it costs no dependency.
 *
 * Only the id and quantity are stored. Prices and names are looked up from the
 * catalogue at render time, so a basket left open for a week cannot show a
 * price that changed three days ago — the stale figure is the one thing a
 * cart must never display.
 */
export const CART_KEY = "sirc.cart.v1";
export const WISHLIST_KEY = "sirc.wishlist.v1";

/** Fired after a write so other components re-read without a state library. */
export const CART_EVENT = "sirc:cart";
export const WISHLIST_EVENT = "sirc:wishlist";

export interface CartLine {
  productId: string;
  quantity: number;
}

/** A cart line joined to its product, as the UI needs it. */
export interface ResolvedLine {
  product: Product;
  quantity: number;
  /** Unit price in poisha at render time. */
  unitPrice: number;
  lineTotal: number;
}

export const MAX_QUANTITY = 99;

/**
 * What a product costs in the cart.
 *
 * Range-priced and quote-only products have no single figure, so they are not
 * addable at all — `null` here is what the add button uses to route them to
 * the quotation form instead.
 */
export const cartUnitPrice = (product: Product): number | null => {
  if (product.isQuoteOnly) return null;
  if (product.priceMin !== null) return null;
  return product.retailPrice;
};

export const isAddable = (product: Product): boolean =>
  cartUnitPrice(product) !== null && product.stockStatus !== "OUT_OF_STOCK";

const isBrowser = () => typeof window !== "undefined";

/** Reads defensively: hand-edited or half-written storage must not crash boot. */
const readList = <T,>(key: string, guard: (value: unknown) => value is T): T[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(guard) : [];
  } catch {
    return [];
  }
};

const isCartLine = (value: unknown): value is CartLine =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as CartLine).productId === "string" &&
  Number.isFinite((value as CartLine).quantity);

const isId = (value: unknown): value is string => typeof value === "string";

const write = (key: string, value: unknown, event: string) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded, or storage disabled in private mode. The in-memory state
    // still updated, so the session works — it just will not survive a reload.
  }
  window.dispatchEvent(new CustomEvent(event));
};

export const readCart = (): CartLine[] =>
  readList(CART_KEY, isCartLine)
    .filter((line) => line.quantity > 0)
    .map((line) => ({
      productId: line.productId,
      quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.floor(line.quantity))),
    }));

export const writeCart = (lines: CartLine[]) => write(CART_KEY, lines, CART_EVENT);

export const readWishlist = (): string[] => readList(WISHLIST_KEY, isId);

export const writeWishlist = (ids: string[]) => write(WISHLIST_KEY, ids, WISHLIST_EVENT);

/**
 * Join stored lines to catalogue products.
 *
 * Lines whose product no longer exists are dropped rather than rendered as a
 * blank row — a discontinued item silently disappearing is better than a cart
 * that cannot be checked out and gives no reason why.
 */
export const resolveLines = (lines: CartLine[], products: Product[]): ResolvedLine[] => {
  const byId = new Map(products.map((product) => [product.id, product]));

  return lines.flatMap((line) => {
    const product = byId.get(line.productId);
    if (!product) return [];

    const unitPrice = cartUnitPrice(product);
    if (unitPrice === null) return [];

    return [{ product, quantity: line.quantity, unitPrice, lineTotal: unitPrice * line.quantity }];
  });
};

export const cartSubtotal = (lines: ResolvedLine[]): number =>
  lines.reduce((total, line) => total + line.lineTotal, 0);

export const cartCount = (lines: CartLine[]): number =>
  lines.reduce((total, line) => total + line.quantity, 0);

/**
 * Delivery options.
 *
 * Free over the threshold, because that is a real commercial rule the business
 * can honour, not a fake urgency device. Figures are placeholders until the
 * business confirms them.
 */
export const FREE_DELIVERY_THRESHOLD = 5_000_000; // ৳50,000 in poisha

export const DELIVERY_OPTIONS = [
  { value: "standard", label: "Standard delivery", cost: 60_000, note: "2–4 working days" },
  { value: "express", label: "Express delivery", cost: 150_000, note: "Next working day, Dhaka & Chattogram" },
  { value: "pickup", label: "Collect from our office", cost: 0, note: "Dhaka, by arrangement" },
] as const;

export type DeliveryValue = (typeof DELIVERY_OPTIONS)[number]["value"];

export const deliveryCost = (option: DeliveryValue, subtotal: number): number => {
  const entry = DELIVERY_OPTIONS.find((item) => item.value === option) ?? DELIVERY_OPTIONS[0];
  if (entry.value === "pickup") return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : entry.cost;
};

/**
 * External-store plumbing for `useSyncExternalStore`.
 *
 * Reading storage in an effect and copying it into state is the obvious
 * approach and the wrong one: it sets state during mount, and it leaves a
 * frame where the UI shows an empty cart that is not empty. React has a
 * purpose-built hook for exactly this — an external source that changes
 * outside React — and it handles the server/client split itself.
 *
 * `getSnapshot` must return a *stable reference* when nothing changed, or the
 * hook re-renders forever. These caches compare the raw string first and only
 * reparse when it actually differs.
 */
const EMPTY_LINES: CartLine[] = [];
const EMPTY_IDS: string[] = [];

let cartRaw: string | null = null;
let cartCache: CartLine[] = EMPTY_LINES;
let wishRaw: string | null = null;
let wishCache: string[] = EMPTY_IDS;

export const getCartSnapshot = (): CartLine[] => {
  if (!isBrowser()) return EMPTY_LINES;
  const raw = window.localStorage.getItem(CART_KEY);
  if (raw !== cartRaw) {
    cartRaw = raw;
    cartCache = readCart();
  }
  return cartCache;
};

export const getWishlistSnapshot = (): string[] => {
  if (!isBrowser()) return EMPTY_IDS;
  const raw = window.localStorage.getItem(WISHLIST_KEY);
  if (raw !== wishRaw) {
    wishRaw = raw;
    wishCache = readWishlist();
  }
  return wishCache;
};

/** Server and hydration snapshot — storage does not exist yet. */
export const getEmptyLines = (): CartLine[] => EMPTY_LINES;
export const getEmptyIds = (): string[] => EMPTY_IDS;

const subscribeTo = (event: string) => (onChange: () => void) => {
  window.addEventListener(event, onChange);
  // `storage` fires only in *other* tabs, which is exactly what keeps two open
  // tabs in step; the custom event covers this one.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(event, onChange);
    window.removeEventListener("storage", onChange);
  };
};

export const subscribeCart = subscribeTo(CART_EVENT);
export const subscribeWishlist = subscribeTo(WISHLIST_EVENT);

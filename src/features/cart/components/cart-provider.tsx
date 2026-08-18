"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

import {
  MAX_QUANTITY,
  cartCount,
  cartSubtotal,
  getCartSnapshot,
  getEmptyIds,
  getEmptyLines,
  getWishlistSnapshot,
  readCart,
  readWishlist,
  resolveLines,
  subscribeCart,
  subscribeWishlist,
  writeCart,
  writeWishlist,
  type CartLine,
  type ResolvedLine,
} from "@/features/cart/services/cart";
import type { Product } from "@/features/catalog/types";

/**
 * Cart and wishlist state.
 *
 * A context over `localStorage` rather than a state library — the whole store
 * is two arrays and six operations, which is not worth a dependency on a site
 * whose premise is that it stays light.
 *
 * State comes from `useSyncExternalStore`, not from an effect copying storage
 * into `useState`. That hook exists for precisely this shape of problem: a
 * source of truth that lives outside React and changes without React's
 * knowledge. It also solves hydration for free — the server snapshot is empty,
 * the client snapshot is real, and React reconciles the two itself, so there
 * is no `mounted` flag and no frame showing an empty cart that is not empty.
 *
 * Storage is the single source of truth: every mutation writes, the write
 * dispatches an event, the event re-reads. There is no path where the
 * in-memory copy and the stored copy can disagree.
 */
interface CartContextValue {
  lines: CartLine[];
  /** Lines joined to live catalogue prices. */
  resolved: ResolvedLine[];
  subtotal: number;
  wishlist: string[];
  count: number;
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * The catalogue is handed in from the server layout so prices are always the
 * current ones. With twenty products that is a trivial payload; against a real
 * catalogue this becomes a lookup endpoint called with the stored ids, and
 * only this component changes.
 */
export function CartProvider({
  children,
  products,
}: {
  children: React.ReactNode;
  products: Product[];
}) {
  const lines = useSyncExternalStore(subscribeCart, getCartSnapshot, getEmptyLines);
  const wishlist = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, getEmptyIds);

  const addItem = useCallback((productId: string, quantity = 1) => {
    const current = readCart();
    const existing = current.find((line) => line.productId === productId);

    writeCart(
      existing
        ? current.map((line) =>
            line.productId === productId
              ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) }
              : line,
          )
        : [...current, { productId, quantity: Math.min(MAX_QUANTITY, Math.max(1, quantity)) }],
    );
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const clamped = Math.min(MAX_QUANTITY, Math.floor(quantity));

    // Dropping to zero removes the line, which is what the stepper's minus
    // button should do at 1 rather than leaving a zero-quantity row.
    if (clamped < 1) {
      writeCart(readCart().filter((line) => line.productId !== productId));
      return;
    }

    writeCart(
      readCart().map((line) =>
        line.productId === productId ? { ...line, quantity: clamped } : line,
      ),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    writeCart(readCart().filter((line) => line.productId !== productId));
  }, []);

  const clearCart = useCallback(() => writeCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    const current = readWishlist();
    writeWishlist(
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist],
  );

  const resolved = useMemo(() => resolveLines(lines, products), [lines, products]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      resolved,
      subtotal: cartSubtotal(resolved),
      wishlist,
      count: cartCount(lines),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      toggleWishlist,
      isWishlisted,
    }),
    [
      lines,
      resolved,
      wishlist,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      toggleWishlist,
      isWishlisted,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}

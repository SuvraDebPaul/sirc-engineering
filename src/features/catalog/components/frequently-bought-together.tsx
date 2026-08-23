"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus } from "lucide-react";

import { useCart } from "@/features/cart/components/cart-provider";
import { Button } from "@/components/ui/button";
import { formatBDT } from "@/lib/format";
import type { BundleEntry } from "@/features/catalog/services/bundles";

/**
 * "Frequently bought together" — the current product plus admin-curated
 * companions, each individually toggleable, summed into one add-to-cart.
 *
 * The current product's own row can't be unchecked — you're already looking
 * at its page, removing it would make "N items" lie about what gets added.
 */
export function FrequentlyBoughtTogether({
  currentProduct,
  items,
}: {
  currentProduct: { id: string; name: string; imageUrl: string | null; retailPrice: number };
  items: BundleEntry[];
}) {
  const { addItem } = useCart();
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(items.map((item) => item.product.id)),
  );
  const [added, setAdded] = useState(false);

  if (items.length === 0) return null;

  const toggle = (id: string) => {
    setAdded(false);
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selected = items.filter((item) => checked.has(item.product.id));
  const total =
    currentProduct.retailPrice +
    selected.reduce((sum, item) => sum + item.product.retailPrice * item.moq, 0);
  const count = 1 + selected.reduce((sum, item) => sum + item.moq, 0);

  const handleAdd = () => {
    addItem(currentProduct.id, 1);
    for (const item of selected) addItem(item.product.id, item.moq);
    setAdded(true);
  };

  return (
    <section className="rounded-2xl border p-5">
      <h2 className="font-semibold tracking-tight">Frequently bought together</h2>

      <ul className="mt-4 space-y-3">
        <li className="flex items-center gap-3 text-sm">
          <span className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {currentProduct.imageUrl && (
              <Image src={currentProduct.imageUrl} alt="" fill sizes="48px" className="object-cover" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{currentProduct.name}</span>
            <span className="text-xs text-muted-foreground">This item</span>
          </span>
          <span className="shrink-0 font-semibold">{formatBDT(currentProduct.retailPrice)}</span>
        </li>

        {items.map((item) => (
          <li key={item.product.id} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={checked.has(item.product.id)}
              onChange={() => toggle(item.product.id)}
              className="size-4 shrink-0 accent-primary"
              aria-label={`Include ${item.product.name}`}
            />
            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
              {item.product.imageUrl && (
                <Image src={item.product.imageUrl} alt="" fill sizes="48px" className="object-cover" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{item.product.name}</span>
              <span className="text-xs text-muted-foreground">
                Qty {item.moq} · {formatBDT(item.product.retailPrice)} each
              </span>
            </span>
            <span className="shrink-0 font-semibold">
              {formatBDT(item.product.retailPrice * item.moq)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">
          Total for {count} {count === 1 ? "item" : "items"}
        </span>
        <span className="text-lg font-bold text-primary">{formatBDT(total)}</span>
      </div>

      <Button type="button" className="mt-4 w-full" onClick={handleAdd}>
        <Plus className="size-4" aria-hidden="true" />
        {added ? "Added to cart" : `Add ${count} ${count === 1 ? "item" : "items"} to cart`}
      </Button>
    </section>
  );
}

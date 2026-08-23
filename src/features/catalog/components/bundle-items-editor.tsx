"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { setBundleItemsAction } from "@/features/catalog/actions/set-bundle-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BundleRow {
  companionId: string;
  moq: number;
}

export function BundleItemsEditor({
  productId,
  products,
  initialItems,
}: {
  productId: string;
  /** Every other product — the companion picker's options. */
  products: { id: string; name: string; modelNumber: string }[];
  initialItems: BundleRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<BundleRow[]>(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const available = (skipIndex: number) =>
    products.filter(
      (product) =>
        product.id === rows[skipIndex]?.companionId ||
        !rows.some((row, i) => i !== skipIndex && row.companionId === product.id),
    );

  const addRow = () => {
    const chosen = new Set(rows.map((row) => row.companionId));
    const next = products.find((product) => !chosen.has(product.id));
    if (!next) return;
    setRows([...rows, { companionId: next.id, moq: 1 }]);
    setSaved(false);
  };

  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
    setSaved(false);
  };

  const updateRow = (index: number, patch: Partial<BundleRow>) => {
    setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    setSaved(false);
  };

  const handleSave = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await setBundleItemsAction(productId, rows);
      if (result?.error) setError(result.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold tracking-tight">Frequently bought together</h2>
          <p className="text-sm text-muted-foreground">
            Shown on this product&apos;s page as a one-click add-on bundle.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={rows.length >= products.length || rows.length >= 10}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add product
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No companion products yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                {index === 0 && <Label className="text-xs">Product</Label>}
                <Select
                  value={row.companionId}
                  onValueChange={(value) => updateRow(index, { companionId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {available(index).map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.modelNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-24 space-y-1">
                {index === 0 && <Label className="text-xs">MOQ</Label>}
                <Input
                  type="number"
                  min={1}
                  value={row.moq}
                  onChange={(event) =>
                    updateRow(index, { moq: Math.max(1, Number(event.target.value) || 1) })
                  }
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(index)}
                aria-label="Remove companion product"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button type="button" size="sm" disabled={isPending} onClick={handleSave}>
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Save bundle
      </Button>
      {saved && !isPending && <span className="ml-3 text-sm text-emerald-600">Saved.</span>}
    </section>
  );
}

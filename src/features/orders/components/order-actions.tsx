"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { updateOrderStatusAction } from "@/features/orders/actions/update-order-status";
import { markOrderPaidAction } from "@/features/orders/actions/mark-order-paid";
import { Button } from "@/components/ui/button";

const STATUSES = ["PENDING", "PROCESSING", "FULFILLED", "CANCELLED"] as const;

export function OrderStatusForm({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const dirty = value !== status;

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, value);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-9 rounded-md border bg-background px-3 text-sm"
      >
        {STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <Button type="button" size="sm" disabled={!dirty || isPending} onClick={handleSave}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Check className="size-4" aria-hidden="true" />
        )}
        Save
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function MarkOrderPaidButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    if (
      !window.confirm(
        "Mark this order as paid? Only do this once payment has actually been received.",
      )
    )
      return;

    setError(null);
    startTransition(async () => {
      const result = await markOrderPaidAction(orderId);
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={handleClick}>
        {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        Mark as paid
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

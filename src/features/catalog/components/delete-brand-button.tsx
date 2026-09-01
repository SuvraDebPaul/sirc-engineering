"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, Loader2, Trash2 } from "lucide-react";

import { deleteBrandAction, deleteBrandCascadeAction } from "@/features/catalog/actions/delete-brand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Brand row delete button.
 *
 * `Product.brandId` is required, so a brand carrying products can never be
 * deleted on its own — the plain `ConfirmDeleteButton` every other admin list
 * uses would just dead-end on the same FK error every time, with no way
 * forward short of hunting down and deleting each product first from a
 * different screen.
 *
 * This shows the real product count up front and, when it's non-zero, offers
 * the cascade explicitly as a second, clearly-labelled action rather than as
 * an automatic retry — deleting N products is a much bigger deal than
 * deleting one brand record, and it should never happen as a side effect of
 * clicking "delete brand" without knowing that's what it does.
 */
export function DeleteBrandButton({
  id,
  name,
  productCount,
}: {
  id: string;
  name: string;
  productCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hasProducts = productCount > 0;
  const productWord = productCount === 1 ? "product" : "products";

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = hasProducts
        ? await deleteBrandCascadeAction(id)
        : await deleteBrandAction(id);

      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          setOpen(next);
          if (!next) setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>
            {hasProducts
              ? `${productCount} ${productWord} are still assigned to this brand.`
              : "This cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        {hasProducts && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Deleting <strong>{name}</strong> will also permanently delete its {productCount}{" "}
              {productWord}. This cannot be undone.
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" disabled={isPending} onClick={handleDelete}>
            {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {isPending
              ? "Deleting…"
              : hasProducts
                ? `Delete brand and ${productCount} ${productWord}`
                : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

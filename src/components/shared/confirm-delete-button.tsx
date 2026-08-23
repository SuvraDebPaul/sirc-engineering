"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";

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
 * The delete button every admin list row needs — confirm, call the action,
 * refresh on success, show the error inline on failure (a category or brand
 * that still has products attached fails this way, not silently).
 *
 * A styled dialog rather than `window.confirm` — the native browser prompt
 * can't be themed, doesn't match the rest of the admin UI, and on some
 * browsers renders with the raw page URL in its title bar, which reads as
 * broken next to everything else here.
 *
 * Generic across entities on purpose: categories, brands and products all
 * had byte-for-byte identical versions of this before it existed as one
 * component.
 */
export function ConfirmDeleteButton({
  name,
  action,
}: {
  /** Shown in the confirmation prompt, e.g. "Fluke Corporation" */
  name: string;
  /** Usually `() => deleteXAction(id)` — the id is already bound by the caller. */
  action: () => Promise<{ error?: string } | void>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await action();
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
        // Only closable by the user once nothing is in flight — an in-progress
        // delete shouldn't be dismissable out from under itself.
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
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>

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
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

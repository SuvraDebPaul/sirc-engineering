"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";

import { toggleWishlistAction } from "@/features/account/actions/toggle-wishlist";
import { Button } from "@/components/ui/button";

export function RemoveWishlistButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleWishlistAction(productId);
          router.refresh();
        })
      }
    >
      {isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <X className="size-4" aria-hidden="true" />}
      Remove
    </Button>
  );
}

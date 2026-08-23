"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { setDefaultAddressAction } from "@/features/account/actions/set-default-address";
import { Button } from "@/components/ui/button";

export function SetDefaultAddressButton({ addressId }: { addressId: string }) {
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
          await setDefaultAddressAction(addressId);
          router.refresh();
        })
      }
    >
      {isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      Set as default
    </Button>
  );
}

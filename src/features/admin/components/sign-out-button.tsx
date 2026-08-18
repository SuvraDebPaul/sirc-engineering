"use client";

import { useTransition } from "react";

import { signOut } from "@/features/admin/actions/sign-out";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => signOut())}
    >
      Sign out
    </Button>
  );
}

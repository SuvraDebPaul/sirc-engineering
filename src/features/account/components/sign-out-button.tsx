"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { signOutAction } from "@/features/account/actions/sign-out";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction())}
      className="w-full justify-start gap-2.5 px-3 text-muted-foreground"
    >
      <LogOut className="size-4" aria-hidden="true" />
      Sign out
    </Button>
  );
}

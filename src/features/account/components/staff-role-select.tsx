"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { updateStaffRoleAction } from "@/features/account/actions/update-staff-role";
import type { AssignableRole } from "@/features/account/services/team-admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_LABEL: Record<AssignableRole, string> = {
  admin: "Admin",
  manager: "Manager",
  customer: "Remove staff access",
};

/** Changes an existing staff member's role — or removes their staff access by setting them back to a customer. */
export function StaffRoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: AssignableRole;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const apply = (next: AssignableRole) => {
    setError(null);
    startTransition(async () => {
      const result = await updateStaffRoleAction(userId, next);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {isPending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />}
        <Select
          value={role}
          onValueChange={(value) => apply(value as AssignableRole)}
          disabled={disabled || isPending}
        >
          <SelectTrigger className="w-44">
            <SelectValue>{ROLE_LABEL[role]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="customer">Remove staff access</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p className="max-w-56 text-right text-xs text-destructive">{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { promoteUserAction } from "@/features/account/actions/promote-user";
import type { StaffRole } from "@/features/account/services/team-admin";
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

/**
 * Gives an existing account admin or manager access.
 *
 * Only works for someone who already has an account — there's no
 * invite-by-email flow yet, so a brand new hire has to sign up on the site
 * first, the same way a customer would, before they can be promoted here.
 */
export function PromoteUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("manager");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const result = await promoteUserAction(email, role);

    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(`${email} is now a${role === "admin" ? "n" : ""} ${role}.`);
    setEmail("");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="promote-email">Email address</Label>
        <Input
          id="promote-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="promote-role">Role</Label>
        <Select value={role} onValueChange={(value) => setRole(value as StaffRole)}>
          <SelectTrigger id="promote-role" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {isSubmitting ? "Adding…" : "Add to team"}
      </Button>

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive sm:basis-full">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {success && (
        <p className="flex items-center gap-1.5 text-sm text-emerald-600 sm:basis-full">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {success}
        </p>
      )}
    </form>
  );
}

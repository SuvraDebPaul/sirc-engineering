"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { updateEnquiryStatusAction } from "@/features/enquiries/actions/update-enquiry-status";
import { Button } from "@/components/ui/button";

type Status = "NEW" | "RESPONDED" | "CLOSED";

/** The status transitions worth offering from each current state. */
const NEXT_ACTIONS: Record<Status, { status: Status; label: string }[]> = {
  NEW: [
    { status: "RESPONDED", label: "Mark responded" },
    { status: "CLOSED", label: "Close" },
  ],
  RESPONDED: [{ status: "CLOSED", label: "Close" }],
  CLOSED: [{ status: "NEW", label: "Reopen" }],
};

export function EnquiryStatusButtons({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const actions = NEXT_ACTIONS[status as Status] ?? NEXT_ACTIONS.NEW;

  const apply = (next: Status) => {
    startTransition(async () => {
      await updateEnquiryStatusAction(id, next);
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2">
      {isPending && <Loader2 className="size-4 animate-spin self-center text-muted-foreground" aria-hidden="true" />}
      {!isPending &&
        actions.map((action) => (
          <Button key={action.status} type="button" size="sm" variant="outline" onClick={() => apply(action.status)}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}

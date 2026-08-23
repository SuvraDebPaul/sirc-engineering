import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { EnquiryStatusButtons } from "@/features/enquiries/components/enquiry-status-buttons";
import { deleteEnquiryAction } from "@/features/enquiries/actions/delete-enquiry";
import { listEnquiriesAdmin } from "@/features/enquiries/services/enquiry-admin";
import { formatDate } from "@/lib/format";

const STATUSES = ["NEW", "RESPONDED", "CLOSED", "ALL"] as const;
type Status = (typeof STATUSES)[number];

const TAB_LABEL: Record<Status, string> = {
  NEW: "New",
  RESPONDED: "Responded",
  CLOSED: "Closed",
  ALL: "All",
};

const KIND_LABEL: Record<string, string> = {
  quotation: "Quotation",
  contact: "Contact",
  comment: "Comment",
};

export default async function AdminEnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  const query = await searchParams;
  const statusRaw = Array.isArray(query.status) ? query.status[0] : query.status;
  const status: Status = STATUSES.includes(statusRaw as Status) ? (statusRaw as Status) : "NEW";

  const enquiries = await listEnquiriesAdmin(status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Enquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quotation requests, contact messages and blog comments awaiting moderation.
        </p>
      </div>

      <div className="flex gap-2">
        {STATUSES.map((value) => (
          <Button key={value} asChild size="sm" variant={value === status ? "default" : "outline"}>
            <Link href={`/admin/enquiries?status=${value}`}>{TAB_LABEL[value]}</Link>
          </Button>
        ))}
      </div>

      {enquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={status === "NEW" ? "No new enquiries" : "Nothing here"}
          description={
            status === "NEW"
              ? "You're caught up — new quotation requests, messages and comments will appear here."
              : "Nothing matches this filter yet."
          }
        />
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry) => {
            const details = (enquiry.details as Record<string, unknown> | null) ?? {};

            return (
              <Card key={enquiry.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{KIND_LABEL[enquiry.kind] ?? enquiry.kind}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{enquiry.reference}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium">{enquiry.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {enquiry.email}
                        {enquiry.phone ? ` · ${enquiry.phone}` : ""} · {formatDate(enquiry.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnquiryStatusButtons id={enquiry.id} status={enquiry.status} />
                      <ConfirmDeleteButton
                        name={`this ${KIND_LABEL[enquiry.kind]?.toLowerCase() ?? "enquiry"}`}
                        action={deleteEnquiryAction.bind(null, enquiry.id)}
                      />
                    </div>
                  </div>

                  {Object.keys(details).length > 0 && (
                    <dl className="mt-3 grid gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                      {Object.entries(details).map(([key, value]) =>
                        value === "" || value === null || value === undefined ? null : (
                          <div key={key} className="flex gap-1">
                            <dt className="capitalize">{key}:</dt>
                            <dd className="text-foreground">{String(value)}</dd>
                          </div>
                        ),
                      )}
                    </dl>
                  )}

                  <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    {enquiry.message}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

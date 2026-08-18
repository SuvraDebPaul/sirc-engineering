import Link from "next/link";
import { Download, FileBadge, FileCog, FileText, ScrollText } from "lucide-react";

import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import type { ProductDocument } from "@/types";

/**
 * Datasheets, manuals and certificates.
 *
 * Instrument buyers live on datasheets — for a considered purchase it is often
 * the deciding document, and a site that does not offer one loses to a site
 * that does.
 *
 * Documents with no hosted file are still listed, as a request link rather
 * than a broken download. That is deliberate: the buyer learns the datasheet
 * exists and we learn exactly which instrument they are evaluating, which is a
 * better outcome than hiding the row. Drop a real path into `url` and the same
 * row becomes a download with no other change.
 */
const ICONS = {
  datasheet: FileText,
  manual: FileCog,
  certificate: FileBadge,
  declaration: ScrollText,
} as const;

export function ProductDocuments({
  documents,
  productName,
  model,
}: {
  documents: ProductDocument[];
  productName: string;
  model: string;
}) {
  if (documents.length === 0) return null;

  return (
    <section className="rounded-2xl border bg-card p-6" aria-labelledby="documents">
      <h2 id="documents" className="text-sm font-semibold tracking-tight">
        Documents
      </h2>

      <ul className="mt-4 divide-y">
        {documents.map((document) => {
          const Icon = ICONS[document.kind];

          return (
            <li key={document.title} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{document.title}</span>
                {document.sizeLabel && (
                  <span className="block text-xs text-muted-foreground">{document.sizeLabel}</span>
                )}
              </span>

              {document.url ? (
                <a
                  href={document.url}
                  download
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Download className="size-3.5" aria-hidden="true" />
                  Download
                </a>
              ) : (
                <Link
                  href={`/rfq?type=other&sku=${encodeURIComponent(model)}`}
                  className="shrink-0 text-sm font-medium text-primary hover:underline"
                  aria-label={`Request ${document.title}`}
                >
                  Request
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Need the specification checked against your application first?
        </p>

        <WhatsAppButton
          className="mt-3 w-full"
          label="Ask an engineer on WhatsApp"
          message={`Hello, I have a question about the ${productName} (${model}).`}
        />
      </div>
    </section>
  );
}

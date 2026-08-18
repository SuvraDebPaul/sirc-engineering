import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { QuoteRequestForm } from "@/components/rfq/quote-request-form";
import { RfqSidebar } from "@/components/rfq/rfq-sidebar";
import { PageHeader } from "@/components/shared/page-header";
import { ENQUIRY_TYPES } from "@/lib/rfq";

export const metadata: Metadata = {
  title: "Request a quotation",
  description:
    "Tell us what you need — an instrument, a calibration, a test or an inspection — and an engineer will come back with a written quotation within one working day.",
};

/**
 * Request a quotation.
 *
 * Every "Ask for price" on the site lands here, carrying the model number in
 * `?sku=`, so the visitor never has to retype something they were already
 * looking at. `?type=` does the same for the enquiry dropdown, which is how a
 * service page can send someone straight to a calibration enquiry.
 *
 * Both are validated against the known vocabulary before being used. `sku` is
 * only ever placed in a `defaultValue`, so it cannot execute — but a hand-made
 * link with a 10,000-character model number should still not reach the form.
 */
const MAX_SKU_LENGTH = 120;

export default async function RfqPage({ searchParams }: PageProps<"/rfq">) {
  const params = await searchParams;

  const rawSku = Array.isArray(params.sku) ? params.sku[0] : params.sku;
  const rawType = Array.isArray(params.type) ? params.type[0] : params.type;

  const sku = (rawSku ?? "").trim().slice(0, MAX_SKU_LENGTH);
  const enquiryType = ENQUIRY_TYPES.find((entry) => entry.value === rawType)?.value ?? "purchase";

  return (
    <>
      <PageHeader
        title="Request a quotation"
        description="Tell us what you need and an engineer will come back with a written quotation — usually the same day, always within one working day."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Request a quotation" }]}
      />

      <Container className="pb-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-10">
          <QuoteRequestForm defaultSku={sku} defaultEnquiryType={enquiryType} />
          <RfqSidebar />
        </div>
      </Container>
    </>
  );
}

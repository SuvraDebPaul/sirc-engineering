import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/shared/page-header";
import { getSiteSettings } from "@/features/settings/services/settings";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that apply to browsing this site and placing an order.",
};

/**
 * Terms of service.
 *
 * ⚠️ **Requires legal review before launch**, same as the privacy policy —
 * see the note there. This is written from how the site and checkout
 * actually behave (verified against `features/cart/services/checkout.ts` and
 * `features/orders/services/order-create.ts`), not boilerplate: an order is a
 * request the sales desk confirms, nothing is charged at checkout, and cash
 * on delivery is the only settlement method because no payment gateway is
 * wired in.
 *
 * A few sections need a real business decision before they're accurate,
 * flagged inline rather than invented: manufacturer warranty terms vary by
 * brand and aren't recorded anywhere in the code, and a cancellation window
 * is a policy choice, not something derivable from what the site does.
 */
function buildSections(settings: {
  name: string;
  address: string;
  email: string;
  phone: string;
}): { heading: string; paragraphs: string[] }[] {
  return [
    {
      heading: "Who we are",
      paragraphs: [
        `This site is operated by ${settings.name}, ${settings.address}. These terms apply whenever you browse this site, submit an enquiry, or place an order. If anything here is unclear, contact us at ${settings.email} or ${settings.phone} before you order.`,
      ],
    },
    {
      heading: "Placing an order",
      paragraphs: [
        "Adding an item to your cart and completing checkout submits a request, not a confirmed sale. Nothing is charged when you place an order. Our sales desk reviews it, confirms stock and lead time, and sends an invoice — you can reply to that invoice to change or cancel anything before it ships.",
        "Cash on delivery is currently the only payment method offered. You pay the courier when your order arrives; nothing is collected online.",
      ],
    },
    {
      heading: "Pricing",
      paragraphs: [
        "Prices shown on the site are indicative and subject to confirmation at the time we review your order — stock, freight and duty on imported instruments can shift between when a page was priced and when you order. We will always tell you before dispatch if a confirmed price differs from what was shown, and you are free to cancel at that point.",
        "Some products are marked \"quote only\" or show a price range, because their price genuinely depends on configuration, quantity or calibration scope. Those are quoted individually through the request-a-quotation form.",
      ],
    },
    {
      heading: "Delivery",
      paragraphs: [
        "Delivery cost and estimated timeframe are shown at checkout before you place an order, and depend on whether the delivery address is inside or outside Dhaka.",
        "Delivery dates given by our sales desk are estimates. We will contact you if a delay affects a date we already confirmed.",
      ],
    },
    {
      heading: "Cancelling an order",
      paragraphs: [
        "You can cancel or change an order any time before we confirm dispatch — reply to your invoice or call us. Once an order has shipped, see our Return & refund policy.",
      ],
    },
    {
      heading: "Warranty",
      paragraphs: [
        "Instruments we supply carry the warranty terms of their manufacturer, as stated on the product page or your invoice. Calibration certificates state the standards and uncertainty the work was performed to; a certificate has no separate \"warranty\" beyond that record being accurate.",
      ],
    },
    {
      heading: "Calibration, testing and inspection services",
      paragraphs: [
        "Services requested through this site are quoted individually and confirmed in writing before work begins. Scope, turnaround and price are as stated on that written confirmation, not on the general service description page.",
      ],
    },
    {
      heading: "Website content",
      paragraphs: [
        `Product descriptions, photographs, articles and other content on this site belong to ${settings.name} or are used with the rights holder's permission — see our Image credits page for photography sources. You may not reproduce or resell this content without asking us first.`,
      ],
    },
    {
      heading: "Liability",
      paragraphs: [
        `${settings.name} is not liable for indirect or consequential loss arising from a delayed delivery, an out-of-stock item, or an error on this website that we correct once we become aware of it. Nothing in these terms limits liability that cannot be limited by law.`,
      ],
    },
    {
      heading: "Governing law",
      paragraphs: ["These terms are governed by the laws of Bangladesh."],
    },
    {
      heading: "Changes to these terms",
      paragraphs: [
        "If we change how ordering, pricing or delivery works on this site, this page is updated before that change goes live, not after.",
      ],
    },
  ];
}

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const SECTIONS = buildSections(settings);

  return (
    <>
      <PageHeader
        title="Terms of service"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms of service" }]}
      />

      <Container className="pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Draft — pending legal review.</span> This
              describes how ordering, pricing and delivery actually work on this site. It has not been
              reviewed by a lawyer, and warranty terms and the cancellation window need a business
              decision before they can be stated more specifically.
            </p>
          </div>

          <div className="mt-10 space-y-10">
            {SECTIONS.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-bold uppercase tracking-tight">{section.heading}</h2>

                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 border-t pt-6 text-sm text-muted-foreground">
            Questions about any of this?{" "}
            <Link href="/contact" className="font-medium text-primary hover:underline">
              Get in touch
            </Link>
            .
          </p>
        </div>
      </Container>
    </>
  );
}

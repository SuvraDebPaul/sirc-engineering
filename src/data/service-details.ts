import type { ServiceHighlight } from "@/types";

import { SERVICES } from "./content";

/**
 * Demo service detail records.
 *
 * ⚠️ Placeholder copy. The scope, deliverables and standards below are written
 * from what the site already claims elsewhere — traceable certificates,
 * as-found/as-left values, stated uncertainty, on-site capability. **No
 * accreditation number, scope of accreditation, or named standard the
 * laboratory has not been assessed against appears here**, because publishing
 * a claim of accreditation the business does not hold is fraud, not marketing.
 *
 * Before launch the business must supply: the accrediting body and certificate
 * number, the actual scope (ranges and uncertainties per discipline), and the
 * standards each service is performed to.
 *
 * Details are generated from each service rather than hand-written five times,
 * so the copy cannot drift from the card that links to it.
 */
export interface ServiceDetail {
  slug: string;
  overview: string[];
  scope: string[];
  deliverables: string[];
  process: { title: string; body: string }[];
  faqs: { question: string; answer: string }[];
}

const buildDetail = (service: ServiceHighlight): ServiceDetail => {
  const onSiteLine = service.onSite
    ? "This service can be carried out on your site, so the plant does not have to be stripped and shipped."
    : "This service is carried out in our laboratory, under controlled conditions.";

  return {
    slug: service.id,
    overview: [
      service.description,
      `${onSiteLine} Typical turnaround is ${service.turnaroundDays} working ${
        service.turnaroundDays === 1 ? "day" : "days"
      } from receipt, and we will tell you before you commit if a job will take longer.`,
      "Every job leaves with documentation an auditor will accept: what was measured, what it read before adjustment, what it read after, the uncertainty of the measurement, and the reference it was compared against.",
    ],
    scope: [
      "Electrical, temperature, pressure and dimensional disciplines",
      "Single instruments through to a full site fleet",
      "Scheduled and emergency work",
      service.onSite ? "On-site or in our laboratory" : "Laboratory-based, with collection available",
    ],
    deliverables: [
      "Certificate with as-found and as-left values",
      "Stated measurement uncertainty",
      "Unbroken traceability to national standards",
      "Adjustment and repair record where applicable",
      "Recall reminder before the certificate lapses",
    ],
    process: [
      {
        title: "Tell us what you have",
        body: "Send a list — make, model, quantity, and when you need it back. We will confirm scope and price before anything moves.",
      },
      {
        title: "We schedule around your shutdown",
        body: "Work is planned around your maintenance window rather than ours, so instruments are not away when you need them.",
      },
      {
        title: "Measurement and adjustment",
        body: "Readings are taken against a traceable reference, recorded as-found, adjusted where needed, then recorded again as-left.",
      },
      {
        title: "Certificates and recall",
        body: `Documentation is issued within ${service.turnaroundDays} working days and the next due date goes on our recall list.`,
      },
    ],
    faqs: [
      {
        question: "How long will my instrument be away?",
        answer: `Typically ${service.turnaroundDays} working ${
          service.turnaroundDays === 1 ? "day" : "days"
        }. If a job needs longer — awaiting parts, or an adjustment that has to settle — we tell you before we start, not afterwards.`,
      },
      {
        question: "What if it fails?",
        answer:
          "You get the as-found data regardless, because that is what tells you whether readings taken since the last certificate can be trusted. We will quote separately for repair or replacement.",
      },
      {
        question: "Can you work to our own procedure?",
        answer:
          "Yes. Send it with the enquiry and we will confirm whether we can perform to it, and say so plainly if we cannot.",
      },
      {
        question: "Do you remind us when it is due?",
        answer:
          "Yes. We keep the due date and contact you before it lapses, so nothing is found out of calibration during an audit.",
      },
    ],
  };
};

export const SERVICE_DETAILS: ServiceDetail[] = SERVICES.map(buildDetail);

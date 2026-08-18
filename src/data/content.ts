import type {
  Feature,
  Post,
  Promotion,
  ServiceHighlight,
  Testimonial,
} from "@/features/content/types";

/**
 * Marketing content for the home page.
 *
 * Copy is written for an industrial buyer, not a consumer: it leads with what
 * the instrument proves and what the certificate has to withstand, because
 * that is what the purchase decision actually turns on.
 */

export const HERO_SLIDES: Promotion[] = [
  {
    id: "hero-1",
    eyebrow: "Calibration & instrument supply",
    title: "Measurement you can defend to an auditor",
    subtitle:
      "Traceable certificates, as-found and as-left values, and recall reminders before your instruments fall due.",
    ctaLabel: "Request a quotation",
    href: "/rfq",
    imageUrl: "/images/catalog/hero-1.jpg",
    tone: "dark",
  },
  {
    id: "hero-2",
    eyebrow: "ISO/IEC 17025 practice",
    title: "An in-house laboratory, not a middleman",
    subtitle:
      "Electrical, temperature and pressure calibration performed here — with stated uncertainty and a named reference standard on every certificate.",
    ctaLabel: "Our services",
    href: "/services",
    imageUrl: "/images/catalog/hero-2.jpg",
    tone: "slate",
  },
  {
    id: "hero-3",
    eyebrow: "Supply & support",
    title: "Instruments chosen by engineers who use them",
    subtitle:
      "Fluke, Megger, Testo, Hioki and Yokogawa — specified, supplied and calibrated by the same team.",
    ctaLabel: "Browse instruments",
    href: "/products",
    imageUrl: "/images/catalog/hero-3.jpg",
    tone: "dark",
  },
];

export const PROMOTIONS: Promotion[] = [
  {
    id: "promo-insulation",
    eyebrow: "In stock now",
    title: "5 kV insulation testers",
    subtitle: "Diagnostic PI, DAR and step-voltage testing",
    ctaLabel: "Shop now",
    href: "/category/insulation-resistance-and-battery",
    imageUrl: "/images/catalog/p1.jpg",
    tone: "slate",
  },
  {
    id: "promo-thermal",
    eyebrow: "Pre-monsoon inspection",
    title: "Thermal imaging survey",
    subtitle: "Find the loose termination before it finds you",
    ctaLabel: "Book a survey",
    href: "/services/thermographic-survey",
    imageUrl: "/images/catalog/svc-inspection.jpg",
    tone: "amber",
  },
  {
    id: "promo-wide",
    eyebrow: "Annual contract",
    title: "Put your whole instrument fleet on one schedule",
    subtitle:
      "We hold your asset register, calibrate before each due date and guarantee priority turnaround.",
    ctaLabel: "Talk to us",
    href: "/services/instrument-fleet-amc",
    imageUrl: "/images/catalog/p5.jpg",
    tone: "dark",
  },
  {
    id: "promo-safety",
    eyebrow: "Site essentials",
    title: "Safety & PPE",
    subtitle: "Everything the site engineer needs",
    ctaLabel: "Shop safety",
    href: "/category/industrial-safety",
    imageUrl: "/images/catalog/promo-safety.jpg",
    tone: "amber",
  },
  {
    id: "promo-power",
    eyebrow: "Trade prices",
    title: "Power tools & equipment",
    subtitle: "Bulk pricing for contractors",
    ctaLabel: "See range",
    href: "/category/power-tools",
    imageUrl: "/images/catalog/promo-power.jpg",
    tone: "slate",
  },
];

export const FEATURES: Feature[] = [
  {
    id: "traceable",
    icon: "Crosshair",
    title: "Traceable calibration",
    description: "Unbroken chain to national standards",
  },
  {
    id: "recall",
    icon: "Gauge",
    title: "Recall reminders",
    description: "We contact you before instruments fall due",
  },
  {
    id: "onsite",
    icon: "Wrench",
    title: "On-site service",
    description: "Where the instrument cannot leave the process",
  },
  {
    id: "support",
    icon: "ShieldCheck",
    title: "Application support",
    description: "Engineers who have used what they sell",
  },
];

export const SERVICES: ServiceHighlight[] = [
  {
    id: "calibration",
    imageUrl: "/images/catalog/svc-calibration.jpg",
    icon: "Crosshair",
    title: "Calibration",
    description:
      "Electrical, temperature and pressure instruments calibrated against traceable references, with as-found and as-left values on every certificate.",
    href: "/services/calibration",
    turnaroundDays: 5,
    onSite: true,
  },
  {
    id: "testing",
    imageUrl: "/images/catalog/svc-testing.jpg",
    icon: "Zap",
    title: "Testing",
    description:
      "Earth resistance, insulation and continuity testing with certified reports for compliance and insurance records.",
    href: "/services/testing",
    turnaroundDays: 3,
    onSite: true,
  },
  {
    id: "inspection",
    imageUrl: "/images/catalog/svc-inspection.jpg",
    icon: "ScanSearch",
    title: "Inspection",
    description:
      "Thermographic surveys of switchgear and motors under representative load, with findings ranked by severity and timescale.",
    href: "/services/inspection",
    turnaroundDays: 5,
    onSite: true,
  },
  // These two were advertised by home-page promo banners that pointed at
  // /services/<id> before any such service existed, so both links 404'd. They
  // are real offerings, so the fix is the record rather than a redirect.
  // Photography is shared with the services above until the business supplies
  // its own.
  {
    id: "thermographic-survey",
    imageUrl: "/images/catalog/svc-inspection.jpg",
    icon: "Thermometer",
    title: "Thermographic survey",
    description:
      "Infrared survey of switchgear, motors and terminations under representative load, with every anomaly ranked by severity and a recommended timescale.",
    href: "/services/thermographic-survey",
    turnaroundDays: 5,
    onSite: true,
  },
  {
    id: "instrument-fleet-amc",
    imageUrl: "/images/catalog/svc-calibration.jpg",
    icon: "Cog",
    title: "Instrument fleet management",
    description:
      "Your whole fleet on one calibration schedule, with recall reminders, collection and delivery, and a single annual contract instead of dozens of purchase orders.",
    href: "/services/instrument-fleet-amc",
    turnaroundDays: 5,
    onSite: true,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    headline: "Certificates that satisfy the auditor.",
    quote:
      "Their certificates carry as-found values, which is exactly what our auditor asks for. We stopped having to explain ourselves at every inspection.",
    authorName: "Rafiqul Islam",
    authorRole: "Maintenance Manager",
    company: "Meghna Textiles Ltd",
  },
  {
    id: "t2",
    headline: "Sixty loops calibrated, no shutdown.",
    quote:
      "They calibrated sixty loops on site over three days without shutting the plant down. Nobody else would quote it that way.",
    authorName: "Hasibul Alam",
    authorRole: "Instrumentation Engineer",
    company: "Sylhet Gas Fields Ltd",
  },
  {
    id: "t3",
    headline: "Recalled before the due date, every time.",
    quote:
      "The recall reminder reached us a month before the due date. Previously we found out during the audit, which is far too late.",
    authorName: "Ayesha Siddiqua",
    authorRole: "QA Manager",
    company: "Bengal Pharmaceuticals Ltd",
  },
];

export const POSTS: Post[] = [
  {
    id: "post-1",
    slug: "how-often-should-instruments-be-calibrated",
    title: "How often should your instruments be calibrated?",
    excerpt:
      "Twelve months is a convention, not a rule. The right interval comes from drift, duty and what a wrong reading costs.",
    category: "Calibration",
    author: "SIRC Laboratory",
    publishedAt: "2026-08-05",
    imageUrl: "/images/catalog/post-1.jpg",
    readMinutes: 6,
    tags: ["Calibration", "Intervals", "Drift", "Compliance"],
  },
  {
    id: "post-2",
    slug: "reading-a-calibration-certificate",
    title: "How to read a calibration certificate",
    excerpt:
      "A pass stamp tells you almost nothing. Here is what to look for — and which omissions should worry you.",
    category: "Quality",
    author: "SIRC Laboratory",
    publishedAt: "2026-07-24",
    imageUrl: "/images/catalog/post-2.jpg",
    readMinutes: 8,
    tags: ["Certificates", "Uncertainty", "Traceability", "Audit"],
  },
  {
    id: "post-3",
    slug: "thermographic-survey-what-to-expect",
    title: "Thermographic surveys: what a good one looks like",
    excerpt:
      "A hot spot without a load figure is not a finding. What to ask for before you book a thermal survey.",
    category: "Inspection",
    author: "SIRC Laboratory",
    publishedAt: "2026-07-09",
    imageUrl: "/images/catalog/post-3.png",
    readMinutes: 7,
    tags: ["Thermography", "Inspection", "Preventive maintenance"],
  },
];

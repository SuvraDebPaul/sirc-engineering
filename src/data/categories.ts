import type { Category } from "@/features/catalog/types";

/**
 * Demo product categories.
 *
 * Replace this file's export with a database or CMS call and nothing else in
 * the app changes — the route handler in `app/api/categories` is the only
 * consumer, and pages reach it through `lib/api/categories.ts`.
 */
// This demo file predates the parent/child hierarchy and stays flat — the
// live app no longer reads it (only `scripts/seed-catalog.ts` does), so the
// type just omits the field rather than adding `parentId: null` to all 24
// entries.
export const CATEGORIES: Omit<Category, "parentId">[] = [
  {
    id: "calibration",
    name: "Calibration",
    slug: "calibration",
    icon: "Crosshair",
    imageUrl: "/images/calibration.webp",
  },
  {
    id: "cleaning-and-supplies",
    name: "Cleaning & Supplies",
    slug: "cleaning-and-supplies",
    icon: "SprayCan",
    imageUrl: "/images/cleaning-and-supplies-658a5d73697a8.webp",
  },
  {
    id: "construction-supply",
    name: "Construction Supply",
    slug: "construction-supply",
    icon: "Construction",
    imageUrl: "/images/construction-supply-658a5d99577af.webp",
  },
  {
    id: "drone-solutions",
    name: "Drone Solutions",
    slug: "drone-solutions",
    icon: "Drone",
    imageUrl: "/images/drones-solutions-68c7ca9f291f2.webp",
  },
  {
    id: "education",
    name: "Education & Training",
    slug: "education",
    icon: "GraduationCap",
    imageUrl: "/images/education-658a5cf4c47af.webp",
  },
  {
    id: "electrical-tools",
    name: "Electrical Tools",
    slug: "electrical-tools",
    icon: "PlugZap",
    imageUrl: "/images/electrical-tools.webp",
  },
  {
    id: "energy",
    name: "Energy",
    slug: "energy",
    icon: "Gauge",
    imageUrl: "/images/energy-658a5ca29ee69.webp",
  },
  {
    id: "fault-testing",
    name: "Fault Testing",
    slug: "fault-testing",
    icon: "ScanSearch",
    imageUrl: "/images/foult-testing-658a5ce54cb0f.webp",
  },
  {
    id: "garden-tools",
    name: "Garden Tools",
    slug: "garden-tools",
    icon: "Shovel",
  },
  {
    id: "hand-tools",
    name: "Hand Tools",
    slug: "hand-tools",
    icon: "Hammer",
  },
  {
    id: "hvac",
    name: "HVAC",
    slug: "hvac",
    icon: "Fan",
    imageUrl: "/images/hvac.webp",
  },
  {
    id: "industrial-safety",
    name: "Industrial Safety",
    slug: "industrial-safety",
    icon: "ShieldCheck",
    imageUrl: "/images/safety-tools-658a5d86445aa.webp",
  },
  {
    id: "insulation-resistance-and-battery",
    name: "Insulation Resistance & Battery",
    slug: "insulation-resistance-and-battery",
    icon: "BatteryCharging",
    imageUrl: "/images/insulation-resistance-and-battery-6624cfcf6c1d8.webp",
  },
  {
    id: "lightning-protection-system",
    name: "Lightning Protection System",
    slug: "lightning-protection-system",
    icon: "Zap",
    imageUrl: "/images/lightning-protection-system-658a5cebb52f2.webp",
  },
  {
    id: "machines",
    name: "Machines",
    slug: "machines",
    icon: "Cog",
    imageUrl: "/images/machines-6651d048cb0d8.webp",
  },
  {
    id: "measuring-and-marking",
    name: "Measuring & Marking Tools",
    slug: "measuring-and-marking",
    icon: "Ruler",
  },
  {
    id: "mechanical",
    name: "Mechanical",
    slug: "mechanical",
    icon: "Wrench",
    imageUrl: "/images/mechanical-658a5cabb5542.webp",
  },
  {
    id: "networking",
    name: "Networking",
    slug: "networking",
    icon: "Network",
    imageUrl: "/images/networking-658a5cbf6924b.webp",
  },
  {
    id: "pharma-health-biomedical",
    name: "Pharma, Health & Biomedical",
    slug: "pharma-health-biomedical",
    icon: "FlaskConical",
    imageUrl: "/images/pharma-health-biomedical-658a5cb835d95.webp",
  },
  {
    id: "power-tools",
    name: "Power Tools",
    slug: "power-tools",
    icon: "Drill",
    imageUrl: "/images/powertools-dfdsfsd-658a5d807d955.webp",
  },
  {
    id: "safety-tools",
    name: "Safety Tools",
    slug: "safety-tools",
    icon: "HardHat",
  },
  {
    id: "solar-energy",
    name: "Solar Energy",
    slug: "solar-energy",
    icon: "Sun",
    imageUrl: "/images/solar-energy-68c81098afabd.webp",
  },
  {
    id: "temperature",
    name: "Temperature",
    slug: "temperature",
    icon: "Thermometer",
    imageUrl: "/images/temperatures.webp",
  },
  {
    id: "transformer",
    name: "Transformer",
    slug: "transformer",
    icon: "UtilityPole",
    imageUrl: "/images/transformer-658a5cc9e8220.webp",
  },
];

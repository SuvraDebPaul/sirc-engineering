import type { IconName } from "@/lib/icons";

/**
 * Industries served.
 *
 * B2B buyers self-identify by sector before they identify by product — a
 * pharmaceutical QA manager searches for what their audit requires, not for
 * "data logger". These pages are how that search lands somewhere useful, and
 * they are the strongest organic-search surface the site has.
 *
 * The content is written from what each sector genuinely has to measure and
 * why. No client names, no case studies and no claimed installations appear
 * here: those are the business's to supply, and inventing them would be
 * fabricating references.
 *
 * `categoryNames` and `brands` are used to pull real products onto each page,
 * so an industry page is never an essay with nothing to buy underneath it.
 */
export interface Industry {
  slug: string;
  name: string;
  icon: IconName;
  imageUrl: string;
  /** One line for the card. */
  summary: string;
  intro: string[];
  /** What this sector measures, and the reason it matters. */
  needs: { title: string; body: string }[];
  /** Product categories relevant to this sector, matched on `categoryName`. */
  categoryNames: string[];
  /** Services this sector buys most. */
  serviceIds: string[];
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "textiles-and-rmg",
    name: "Textiles & RMG",
    icon: "Cog",
    imageUrl: "/images/catalog/svc-inspection.jpg",
    summary: "Buyer audits, boiler safety and the electrical load behind every shift.",
    intro: [
      "Ready-made garments is the sector where measurement is most often audited by somebody other than the regulator. International buyers send their own inspectors, and those inspectors ask for calibration certificates by name.",
      "The instruments that matter here are rarely exotic. They are the meters checking that a boiler gauge reads true, that a dyeing bath is at the temperature the recipe assumes, and that the switchboard feeding four hundred machines is not running hot.",
    ],
    needs: [
      {
        title: "Buyer and compliance audits",
        body: "Certificates with as-found values, stated uncertainty and traceability — the three things an auditor checks and the three most commonly missing.",
      },
      {
        title: "Boiler and steam safety",
        body: "Pressure gauges and temperature instruments verified against a reference, not against each other.",
      },
      {
        title: "Electrical load and safety",
        body: "Insulation resistance, earth continuity and thermographic surveys of the distribution feeding production floors.",
      },
      {
        title: "Process consistency",
        body: "Temperature and humidity logging through dyeing, drying and finishing, so a failed batch can be explained.",
      },
    ],
    categoryNames: ["Temperature", "Electrical Tools", "Calibration", "Energy"],
    serviceIds: ["calibration", "thermographic-survey", "inspection"],
  },
  {
    slug: "pharmaceutical",
    name: "Pharmaceutical & Healthcare",
    icon: "FlaskConical",
    imageUrl: "/images/catalog/svc-calibration.jpg",
    summary: "GMP documentation, cold chain, and measurements that must survive inspection.",
    intro: [
      "Pharmaceutical manufacturing is the most documentation-heavy sector we serve. Under GMP the measurement is not finished when the reading is taken — it is finished when the reading can be defended, years later, by somebody who was not there.",
      "That makes as-found data non-negotiable. If an instrument is found out of tolerance, the question is never about the instrument; it is about every batch released on its readings since the last certificate.",
    ],
    needs: [
      {
        title: "GMP-grade documentation",
        body: "Certificates that record as-found and as-left values, so a reverse traceability assessment is possible rather than guesswork.",
      },
      {
        title: "Cold chain and storage",
        body: "Temperature and humidity mapping for stores, cold rooms and stability chambers, with logged evidence over time.",
      },
      {
        title: "Cleanroom and utilities",
        body: "Differential pressure, airflow and particle-relevant measurement across controlled environments.",
      },
      {
        title: "Scheduled recalibration",
        body: "Fixed intervals with recall before the due date, because an expired certificate found during an inspection is a finding on its own.",
      },
    ],
    categoryNames: ["Temperature", "Calibration", "Measuring & Marking Tools"],
    serviceIds: ["calibration", "testing", "instrument-fleet-amc"],
  },
  {
    slug: "power-and-energy",
    name: "Power & Energy",
    icon: "UtilityPole",
    imageUrl: "/images/catalog/hero-2.jpg",
    summary: "Substations, transformers and finding the fault before it finds you.",
    intro: [
      "In generation and distribution, the cost of a wrong reading is measured in outage hours. The instruments here are diagnostic rather than indicative — they exist to find the fault that has not yet caused a failure.",
      "Most of this work happens on live or recently isolated plant, which is why the certificate and the competence behind it matter as much as the instrument.",
    ],
    needs: [
      {
        title: "Insulation and cable diagnostics",
        body: "Polarisation index, dielectric discharge and step-voltage testing on cables, motors and transformer windings.",
      },
      {
        title: "Earthing systems",
        body: "Four-wire earth resistance testing on substation grids and lightning protection.",
      },
      {
        title: "Power quality",
        body: "Harmonics, imbalance and transient capture where sensitive loads are misbehaving for reasons nobody can see.",
      },
      {
        title: "Predictive thermography",
        body: "Surveys under representative load, ranked by severity, so shutdown work is planned rather than reactive.",
      },
    ],
    categoryNames: ["Insulation Resistance & Battery", "Fault Testing", "Energy", "Electrical Tools"],
    serviceIds: ["testing", "thermographic-survey", "inspection"],
  },
  {
    slug: "oil-gas-and-chemical",
    name: "Oil, Gas & Chemical",
    icon: "Gauge",
    imageUrl: "/images/catalog/svc-testing.jpg",
    summary: "Pressure, gas detection and loop calibration where the margin for error is zero.",
    intro: [
      "Process plant is where instrumentation is least forgiving. A pressure transmitter reading two percent high is invisible on a screen and consequential in a vessel, and a gas detector that has drifted is worse than no detector because it is trusted.",
      "Work here is scheduled around turnarounds, which is why we plan around your shutdown window rather than our own.",
    ],
    needs: [
      {
        title: "Loop and transmitter calibration",
        body: "Pressure and temperature loops calibrated end to end, on site where the instrument cannot leave the process.",
      },
      {
        title: "Gas detection",
        body: "Bump testing and calibration of portable and fixed detectors against certified span gas.",
      },
      {
        title: "Asset integrity",
        body: "Ultrasonic wall thickness measurement on vessels and pipework for corrosion monitoring.",
      },
      {
        title: "Shutdown scheduling",
        body: "Fleet calibration planned into the turnaround so instruments are not away when the plant is down.",
      },
    ],
    categoryNames: ["Calibration", "Industrial Safety", "Temperature", "Measuring & Marking Tools"],
    serviceIds: ["calibration", "inspection", "instrument-fleet-amc"],
  },
  {
    slug: "construction-and-infrastructure",
    name: "Construction & Infrastructure",
    icon: "HardHat",
    imageUrl: "/images/catalog/promo-safety.jpg",
    summary: "Site testing, handover documentation and the measurements a client signs against.",
    intro: [
      "On a construction project, measurement is what turns work into a handover. Earthing tested, insulation verified, levels set — each one becomes a document somebody signs, and the certificate outlives everyone on site.",
      "Instruments here take a beating, which changes the calibration conversation: the right interval for a meter living in a site vehicle is not the right interval for one on a bench.",
    ],
    needs: [
      {
        title: "Electrical installation testing",
        body: "Insulation resistance, continuity and earth loop testing to support installation certificates.",
      },
      {
        title: "Setting out and verification",
        body: "Distance, level and alignment measurement where a small error compounds across a structure.",
      },
      {
        title: "Site safety",
        body: "Gas detection for confined space entry, plus the PPE and metering that goes with it.",
      },
      {
        title: "Handover documentation",
        body: "Certified results packaged for the client's own file, not just for yours.",
      },
    ],
    categoryNames: ["Electrical Tools", "Measuring & Marking Tools", "Industrial Safety", "Fault Testing"],
    serviceIds: ["testing", "calibration", "inspection"],
  },
  {
    slug: "food-and-beverage",
    name: "Food & Beverage",
    icon: "Thermometer",
    imageUrl: "/images/catalog/p12.jpg",
    summary: "HACCP temperature control and the evidence behind every critical limit.",
    intro: [
      "Food safety systems are built on critical limits, and a critical limit is only as good as the instrument checking it. Under HACCP the monitoring device at a critical control point has to be calibrated, and the calibration has to be recorded.",
      "The instruments are usually simple. The discipline around them is not — which is where most non-conformances actually come from.",
    ],
    needs: [
      {
        title: "CCP monitoring",
        body: "Probe thermometers and loggers calibrated to a known uncertainty, so a critical limit means something.",
      },
      {
        title: "Cold chain",
        body: "Temperature mapping and logging through chillers, freezers and transport.",
      },
      {
        title: "Process temperature",
        body: "Cooking, pasteurising and holding temperatures verified against a traceable reference.",
      },
      {
        title: "Audit readiness",
        body: "Certificates and recall dates kept current, so an unannounced audit is uneventful.",
      },
    ],
    categoryNames: ["Temperature", "Calibration", "Industrial Safety"],
    serviceIds: ["calibration", "instrument-fleet-amc", "testing"],
  },
];

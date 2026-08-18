/**
 * Article bodies.
 *
 * ⚠️ Written as demo content and **not yet reviewed by the business**. The
 * technical substance is generally sound, but it is written in SIRC's voice
 * and published under SIRC's name, so somebody at the company must read and
 * approve each one before launch — particularly anywhere it implies what the
 * laboratory does or does not offer.
 *
 * Stored as an array of blocks rather than an HTML string: no markdown parser,
 * no `dangerouslySetInnerHTML`, and nothing an editor could paste that would
 * end up executing. A CMS would replace this file wholesale.
 */
export type PostBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

export interface PostBody {
  slug: string;
  blocks: PostBlock[];
}

export const POST_BODIES: PostBody[] = [
  {
    slug: "how-often-should-instruments-be-calibrated",
    blocks: [
      {
        type: "p",
        text: "Ask three engineers how often an instrument needs calibrating and at least two will say twelve months. It is the most common answer in the industry, and for a great many instruments it is a perfectly reasonable one. It is not, however, a rule. Nothing in any major standard says an instrument must be calibrated annually. What the standards actually require is that you can justify whatever interval you have chosen.",
      },
      { type: "h2", text: "What actually determines the interval" },
      {
        type: "p",
        text: "Three things decide how often an instrument should come back to the laboratory, and none of them is the calendar.",
      },
      {
        type: "ul",
        items: [
          "Drift. How far the instrument moves between certificates. This is measurable — it is the difference between the as-found reading this time and the as-left reading last time.",
          "Duty. A clamp meter that lives in a van and gets dropped twice a month is not the same instrument as one that sits on a bench in a temperature-controlled room.",
          "Consequence. What it costs if the reading is wrong. A tester used for a compliance certificate carries more risk than one used for a rough go/no-go check.",
        ],
      },
      {
        type: "p",
        text: "The first of those is the one most people never look at, and it is the one that does the real work. If you have three consecutive certificates showing an instrument arriving well inside tolerance, you have evidence to extend its interval. If it arrives out of tolerance, you have evidence to shorten it — and a much more urgent problem, which we come to below.",
      },
      { type: "h2", text: "Why as-found data matters more than the pass stamp" },
      {
        type: "p",
        text: "When an instrument fails calibration, the certificate is not the important part. The important question is: what did we measure with it since the last time it was certified?",
      },
      {
        type: "quote",
        text: "An out-of-tolerance as-found reading is not a calibration problem. It is a traceability problem affecting every measurement taken since the previous certificate.",
      },
      {
        type: "p",
        text: "This is why a certificate that records only \"pass\" is close to worthless, and why we record as-found values on every job before touching an adjustment. Without them you cannot perform a reverse traceability assessment, and you cannot answer the auditor's question about what happened to the work done with that instrument over the previous year.",
      },
      { type: "h2", text: "A practical starting point" },
      {
        type: "p",
        text: "If you have no drift history at all, start at twelve months — the convention is a convention for a reason, and it is a defensible opening position. Then let the data move it. Review after three cycles. Instruments that arrive comfortably in tolerance three times running are candidates for eighteen or twenty-four months. Instruments that arrive marginal stay where they are. Instruments that fail go to six.",
      },
      {
        type: "p",
        text: "What you should not do is set every instrument in the building to the same interval and never revisit it. That is not a calibration programme; it is a purchase order that repeats itself.",
      },
    ],
  },
  {
    slug: "reading-a-calibration-certificate",
    blocks: [
      {
        type: "p",
        text: "Most calibration certificates get filed without being read. They arrive, somebody checks there is a tick in the pass box, and the folder goes back on the shelf until the auditor asks for it. That is a shame, because the certificate is the only evidence you have that your measurements mean anything — and a surprising number of them do not say what people assume they say.",
      },
      { type: "h2", text: "The four things worth checking" },
      {
        type: "ul",
        items: [
          "As-found and as-left values. Both, as numbers, not as a verdict. If only as-left appears, you cannot tell whether the instrument was drifting.",
          "Measurement uncertainty. A stated figure, per point. \"Within manufacturer's specification\" is not an uncertainty.",
          "Traceability. Which reference standard was used, and its own certificate number. The chain has to be unbroken all the way to a national standard.",
          "Scope. What was actually calibrated. A multimeter certificate covering only DC volts tells you nothing about the current ranges you have been using.",
        ],
      },
      { type: "h2", text: "Omissions that should worry you" },
      {
        type: "p",
        text: "A missing uncertainty figure is the most common gap and the most consequential. Without it you cannot tell whether a reading near a limit is inside or outside — and \"near a limit\" is exactly where decisions get made. If a certificate gives you a tolerance and a result but no uncertainty, it has quietly left the hardest judgement to you.",
      },
      {
        type: "p",
        text: "The second is a pass verdict with no as-found data. It usually means the instrument was adjusted first and measured afterwards. That certificate proves the instrument is accurate today. It proves nothing whatsoever about last Tuesday.",
      },
      { type: "h2", text: "Accreditation is not a single yes or no" },
      {
        type: "p",
        text: "A laboratory's accreditation covers a defined scope: specific quantities, specific ranges, specific uncertainties. A laboratory can be genuinely accredited and still perform work outside that scope — legitimately, but the resulting certificate is not accredited work. Look for the scope, not just the logo, and check the discipline and range you care about actually appears on it.",
      },
      {
        type: "p",
        text: "If you are unsure what you are looking at, send us the certificate. We will tell you what it covers and what it does not, whoever issued it.",
      },
    ],
  },
  {
    slug: "thermographic-survey-what-to-expect",
    blocks: [
      {
        type: "p",
        text: "A thermographic survey finds problems that have not happened yet. A loose termination, an overloaded phase, a failing bearing — all of them get hot before they fail, and all of them are visible through a thermal camera weeks or months before anything trips. Done properly it is one of the cheapest pieces of preventive maintenance available. Done badly it produces a folder of pretty orange pictures and no decisions.",
      },
      { type: "h2", text: "The single most important condition: load" },
      {
        type: "p",
        text: "A thermal survey of an unloaded switchboard is close to worthless. Heat is generated by current, so a connection carrying nothing looks perfect no matter how loose it is. As a rule of thumb, aim for at least 40 percent of normal operating load, and record the actual load alongside every image.",
      },
      {
        type: "p",
        text: "This is the thing most likely to make a survey a waste of money, and it is usually decided by when the survey was scheduled rather than by the thermographer. Book it for a working shift, not a shutdown.",
      },
      { type: "h2", text: "What we need from you" },
      {
        type: "ul",
        items: [
          "Safe access to energised equipment, and whoever holds the permit",
          "Panels open, or infrared windows fitted — thermal cameras cannot see through steel covers",
          "Normal operating load, with the actual figures at the time of the survey",
          "Single-line diagrams or asset lists, so findings can be tied to identifiable equipment",
        ],
      },
      { type: "h2", text: "What you get back" },
      {
        type: "p",
        text: "A report listing every anomaly found, each with a thermal image, a matching visible-light photograph, the temperature rise above reference, the load at the time, and a severity ranking with a recommended timescale. The ranking is the part that matters: a 15 °C rise on a lightly loaded circuit and a 15 °C rise on a fully loaded one are not the same finding, and a report that does not distinguish them is asking you to do the analysis yourself.",
      },
      {
        type: "quote",
        text: "The point of the report is not to tell you what is hot. It is to tell you what to fix first, and what can wait until the next shutdown.",
      },
      {
        type: "p",
        text: "Findings are ranked in four bands, from monitor at next survey through to isolate and repair immediately. Anything in the top band we tell you about on site, on the day — not three weeks later when the report is typed.",
      },
    ],
  },
];

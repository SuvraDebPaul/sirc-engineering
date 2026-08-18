/**
 * Formatting helpers.
 *
 * Money is stored in **poisha** (1/100 taka) as an integer. Converting to a
 * display string is the only place division happens — never do arithmetic on
 * the formatted value.
 */
const bdt = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

export const formatBDT = (poisha: number): string => bdt.format(poisha / 100);

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const formatDate = (value: Date | string | null | undefined): string =>
  value ? dateFormatter.format(new Date(value)) : "—";

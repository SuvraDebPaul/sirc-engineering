import { deliverEnquiry } from "@/lib/enquiry-delivery";

/**
 * Quotation requests — shape, validation and delivery.
 *
 * Validation is hand-written rather than pulled from a schema library. It is
 * nine fields with obvious rules, and a validator small enough to read in one
 * screen is not worth a runtime dependency on a site whose whole premise is
 * that it stays light.
 *
 * The rules run on the **server**, in the action. Client-side `required`
 * attributes are a convenience that a disabled-JavaScript browser, a script
 * error or a direct POST all bypass, so nothing here trusts them.
 */

export const ENQUIRY_TYPES = [
  { value: "purchase", label: "Purchase an instrument" },
  { value: "calibration", label: "Calibration service" },
  { value: "testing", label: "Testing service" },
  { value: "inspection", label: "Inspection service" },
  { value: "training", label: "Training" },
  { value: "other", label: "Something else" },
] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number]["value"];

export interface QuoteRequest {
  name: string;
  company: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  enquiryType: EnquiryType;
  sku: string;
  quantity: number;
  message: string;
}

/** Field name → message. Absent key means the field passed. */
export type FieldErrors = Partial<Record<keyof QuoteRequest | "consent" | "form", string>>;

export interface QuoteFormState {
  status: "idle" | "error" | "success";
  errors: FieldErrors;
  /** Echoed back so a rejected form re-renders with the visitor's typing intact. */
  values: Record<string, string>;
  reference?: string;
}

export const emptyFormState: QuoteFormState = { status: "idle", errors: {}, values: {} };

/**
 * Deliberately permissive: one `@`, a dot in the domain, no whitespace.
 *
 * Stricter patterns reject valid addresses — plus-addressing, new TLDs, long
 * subdomains — and the only way to truly verify an address is to send to it.
 * Turning away a real customer costs far more than accepting a typo.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Digits, spaces and the usual punctuation; 9–15 digits once stripped. */
const PHONE_ALLOWED = /^[\d\s+()-]+$/;

const MAX_QUANTITY = 9999;

const read = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export type ValidationResult =
  | { ok: true; data: QuoteRequest }
  | { ok: false; errors: FieldErrors };

export const validateQuoteRequest = (formData: FormData): ValidationResult => {
  const errors: FieldErrors = {};

  const name = read(formData, "name");
  const company = read(formData, "company");
  const department = read(formData, "department");
  const designation = read(formData, "designation");
  const email = read(formData, "email");
  const phone = read(formData, "phone");
  const sku = read(formData, "sku");
  const message = read(formData, "message");
  const quantityRaw = read(formData, "quantity");
  const enquiryRaw = read(formData, "enquiryType");

  if (name.length < 2) errors.name = "Please tell us your name.";
  else if (name.length > 100) errors.name = "That name is too long.";

  if (company.length > 150) errors.company = "That company name is too long.";

  if (department.length > 120) errors.department = "That department name is too long.";
  if (designation.length > 120) errors.designation = "That job title is too long.";

  if (email === "") errors.email = "We need an email address to send the quotation to.";
  else if (!EMAIL.test(email)) errors.email = "That does not look like an email address.";
  else if (email.length > 200) errors.email = "That email address is too long.";

  // Required, and validated rather than merely present — a mistyped number is
  // worse than none, because it looks like a working way to reach the customer.
  if (phone === "") {
    errors.phone = "We need a phone number to discuss your requirement.";
  } else {
    const digits = phone.replace(/\D/g, "");
    if (!PHONE_ALLOWED.test(phone) || digits.length < 9 || digits.length > 15) {
      errors.phone = "Please enter a valid phone number.";
    }
  }

  if (sku.length > 120) errors.sku = "That is too long for a model number.";

  const enquiryType = ENQUIRY_TYPES.find((entry) => entry.value === enquiryRaw)?.value;
  if (!enquiryType) errors.enquiryType = "Please choose what your enquiry is about.";

  let quantity = 1;
  if (quantityRaw !== "") {
    const parsed = Number(quantityRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_QUANTITY) {
      errors.quantity = `Enter a whole number between 1 and ${MAX_QUANTITY}.`;
    } else {
      quantity = parsed;
    }
  }

  if (message.length < 10) {
    errors.message = "A sentence or two about what you need helps us quote accurately.";
  } else if (message.length > 4000) {
    errors.message = "Please keep this under 4,000 characters.";
  }

  if (formData.get("consent") !== "on") {
    errors.consent = "Please agree to us contacting you about this request.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      name,
      company,
      department,
      designation,
      email,
      phone,
      enquiryType: enquiryType!,
      sku,
      quantity,
      message,
    },
  };
};


/**
 * Hand a validated request to the shared delivery seam.
 *
 * See `lib/enquiry-delivery.ts` — that is the one function to replace when a
 * real destination is chosen.
 */
export async function deliverQuoteRequest(request: QuoteRequest): Promise<string> {
  return deliverEnquiry("quotation", { ...request });
}

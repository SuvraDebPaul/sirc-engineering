/**
 * Checkout shape and validation.
 *
 * ⚠️ **No payment gateway is wired in yet — deliberately, for now.**
 *
 * A checkout that collected card or wallet PIN numbers into a form that
 * merely logged them would be the single most dangerous thing in the
 * codebase — so no card, CVV, expiry or wallet PIN field exists anywhere.
 * Cash on delivery is the only method offered because it is the only one
 * that settles without a gateway: nothing to collect, nothing to confirm
 * manually. bKash and SSLCommerz belong back in `PAYMENT_METHODS` once real
 * integration lands — at which point those fields belong to *their* hosted
 * page, never to ours.
 */
export const PAYMENT_METHODS = [
  {
    value: "cash-on-delivery",
    label: "Cash on delivery",
    note: "Pay in cash when your order arrives.",
  },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export interface CheckoutDetails {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  postcode: string;
  delivery: string;
  payment: PaymentMethod;
  notes: string;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutDetails | "form" | "cart", string>>;

export interface CheckoutState {
  status: "idle" | "error" | "success";
  errors: CheckoutErrors;
  values: Record<string, string>;
  reference?: string;
}

export const emptyCheckoutState: CheckoutState = { status: "idle", errors: {}, values: {} };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const read = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

export const validateCheckout = (
  formData: FormData,
): { ok: true; data: CheckoutDetails } | { ok: false; errors: CheckoutErrors } => {
  const errors: CheckoutErrors = {};

  const firstName = read(formData, "firstName");
  const lastName = read(formData, "lastName");
  const company = read(formData, "company");
  const phone = read(formData, "phone");
  const email = read(formData, "email");
  const address = read(formData, "address");
  const city = read(formData, "city");
  const district = read(formData, "district");
  const postcode = read(formData, "postcode");
  const delivery = read(formData, "delivery");
  const notes = read(formData, "notes");
  const paymentRaw = read(formData, "payment");

  if (firstName.length < 2) errors.firstName = "Please enter your first name.";
  if (phone.replace(/\D/g, "").length < 9) errors.phone = "Please enter a valid phone number.";
  if (email === "") errors.email = "We need an email address for the invoice.";
  else if (!EMAIL.test(email)) errors.email = "That does not look like an email address.";
  if (address.length < 5) errors.address = "Please enter a delivery address.";
  if (city.length < 2) errors.city = "Please enter a city or town.";
  if (district.length < 2) errors.district = "Please enter a district.";

  const payment = PAYMENT_METHODS.find((entry) => entry.value === paymentRaw)?.value;
  if (!payment) errors.payment = "Please choose how you would like to pay.";

  if (notes.length > 2000) errors.notes = "Please keep notes under 2,000 characters.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      firstName,
      lastName,
      company,
      phone,
      email,
      address,
      city,
      district,
      postcode,
      delivery,
      payment: payment!,
      notes,
    },
  };
};

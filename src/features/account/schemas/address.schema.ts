import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Give this address a name, e.g. \"Home\".").max(50),
  firstName: z.string().trim().min(2, "Please enter a first name."),
  lastName: z.string().trim().default(""),
  company: z.string().trim().default(""),
  phone: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length >= 9, "Please enter a valid phone number."),
  address: z.string().trim().min(5, "Please enter a delivery address."),
  city: z.string().trim().min(2, "Please enter a city or town."),
  district: z.string().trim().min(2, "Please enter a district."),
  postcode: z.string().trim().default(""),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type AddressFormValues = z.input<typeof addressSchema>;

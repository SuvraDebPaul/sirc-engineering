"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  addressSchema,
  type AddressFormValues,
  type AddressInput,
} from "@/features/account/schemas/address.schema";
import { createAddressAction } from "@/features/account/actions/create-address";
import { updateAddressAction } from "@/features/account/actions/update-address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";

type AddressRecord = AddressInput & { id: string };

export function AddressForm({ address }: { address?: AddressRecord }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues, unknown, AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label ?? "",
      firstName: address?.firstName ?? "",
      lastName: address?.lastName ?? "",
      company: address?.company ?? "",
      phone: address?.phone ?? "",
      address: address?.address ?? "",
      city: address?.city ?? "",
      district: address?.district ?? "",
      postcode: address?.postcode ?? "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setFormError(null);

    const result = address
      ? await updateAddressAction(address.id, data)
      : await createAddressAction(data);

    if (!result) {
      router.push("/account/addresses");
      return;
    }

    const { form, ...fieldErrors } = result.errors ?? {};
    if (form) setFormError(form);
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (message) setError(field as keyof AddressInput, { message });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl space-y-5">
      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <FormField name="label" label="Address name" required error={errors.label?.message}>
        {(props) => <Input {...props} placeholder="Home, Site office…" {...register("label")} />}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField name="firstName" label="First name" required error={errors.firstName?.message}>
          {(props) => <Input {...props} {...register("firstName")} />}
        </FormField>
        <FormField name="lastName" label="Last name" error={errors.lastName?.message}>
          {(props) => <Input {...props} {...register("lastName")} />}
        </FormField>
      </div>

      <FormField name="company" label="Company" error={errors.company?.message}>
        {(props) => <Input {...props} {...register("company")} />}
      </FormField>

      <FormField name="phone" label="Phone" required error={errors.phone?.message}>
        {(props) => <Input {...props} type="tel" {...register("phone")} />}
      </FormField>

      <FormField name="address" label="Address" required error={errors.address?.message}>
        {(props) => (
          <Input {...props} placeholder="House number, road, area" {...register("address")} />
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-3">
        <FormField name="city" label="City / town" required error={errors.city?.message}>
          {(props) => <Input {...props} {...register("city")} />}
        </FormField>
        <FormField name="district" label="District" required error={errors.district?.message}>
          {(props) => <Input {...props} {...register("district")} />}
        </FormField>
        <FormField name="postcode" label="Postcode" error={errors.postcode?.message}>
          {(props) => <Input {...props} {...register("postcode")} />}
        </FormField>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {address ? "Save changes" : "Save address"}
      </Button>
    </form>
  );
}

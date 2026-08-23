import { AddressForm } from "@/features/account/components/address-form";

export default function NewAddressPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold">Add an address</h2>
      <div className="mt-6">
        <AddressForm />
      </div>
    </div>
  );
}

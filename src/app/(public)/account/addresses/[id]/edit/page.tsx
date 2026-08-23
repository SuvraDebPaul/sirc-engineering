import { notFound } from "next/navigation";

import { AddressForm } from "@/features/account/components/address-form";
import { getAddressForUser } from "@/features/account/services/addresses";
import { requireSession } from "@/lib/require-session";

export default async function EditAddressPage({
  params,
}: PageProps<"/account/addresses/[id]/edit">) {
  const session = await requireSession();
  const { id } = await params;
  const address = await getAddressForUser(session.user.id, id);

  if (!address) notFound();

  return (
    <div>
      <h2 className="text-lg font-semibold">Edit address</h2>
      <div className="mt-6">
        <AddressForm address={address} />
      </div>
    </div>
  );
}

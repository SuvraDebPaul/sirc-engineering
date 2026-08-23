import Link from "next/link";
import { MapPin, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { deleteAddressAction } from "@/features/account/actions/delete-address";
import { SetDefaultAddressButton } from "@/features/account/components/address-actions";
import { listAddresses } from "@/features/account/services/addresses";
import { requireSession } from "@/lib/require-session";

export default async function AccountAddressesPage() {
  const session = await requireSession();
  const addresses = await listAddresses(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Saved addresses</h2>
        <Button asChild size="sm">
          <Link href="/account/addresses/new">
            <Plus className="size-4" aria-hidden="true" />
            Add address
          </Link>
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Save an address to speed up checkout next time."
          actions={
            <Button asChild size="sm">
              <Link href="/account/addresses/new">Add address</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="space-y-2 p-5 text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{address.label}</p>
                  {address.isDefault && <Badge>Default</Badge>}
                </div>

                <p>
                  {address.firstName} {address.lastName}
                </p>
                {address.company && <p className="text-muted-foreground">{address.company}</p>}
                <p className="text-muted-foreground">{address.phone}</p>
                <p>{address.address}</p>
                <p className="text-muted-foreground">
                  {address.city}, {address.district} {address.postcode}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/account/addresses/${address.id}/edit`}>Edit</Link>
                  </Button>
                  {!address.isDefault && <SetDefaultAddressButton addressId={address.id} />}
                  <ConfirmDeleteButton
                    name={address.label}
                    action={deleteAddressAction.bind(null, address.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

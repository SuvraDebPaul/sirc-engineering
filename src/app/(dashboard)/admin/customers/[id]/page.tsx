import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCustomerByIdAdmin } from "@/features/account/services/customer-admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBDT, formatDate } from "@/lib/format";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  PROCESSING: "default",
  FULFILLED: "outline",
  CANCELLED: "destructive",
};

export default async function AdminCustomerDetailPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const customer = await getCustomerByIdAdmin(id);

  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Customers
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{customer.name}</h1>
          {!customer.emailVerified && <Badge variant="outline">Unverified email</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {customer.email} · Joined {formatDate(customer.createdAt)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Orders</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{customer.orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total spent</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{formatBDT(customer.totalSpent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Saved addresses</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{customer.addresses.length}</p>
          </CardContent>
        </Card>
      </div>

      {customer.addresses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {customer.addresses.map((address) => (
              <div key={address.id} className="rounded-xl border p-4 text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{address.label}</p>
                  {address.isDefault && (
                    <Badge variant="secondary" className="text-[10px]">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">
                  {address.firstName} {address.lastName}
                  {address.company ? ` · ${address.company}` : ""}
                </p>
                <p className="text-muted-foreground">{address.phone}</p>
                <p className="mt-1 text-muted-foreground">
                  {address.address}, {address.city}, {address.district} {address.postcode}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {customer.orders.length === 0 ? (
            <p className="px-6 text-sm text-muted-foreground">No orders placed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-2 font-medium">Reference</th>
                    <th className="px-6 py-2 font-medium">Total</th>
                    <th className="px-6 py-2 font-medium">Status</th>
                    <th className="px-6 py-2 font-medium">Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customer.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3 font-mono text-xs">
                        <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                          {order.reference}
                        </Link>
                      </td>
                      <td className="px-6 py-3 font-semibold">{formatBDT(order.total)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>{order.status}</Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

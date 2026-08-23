import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getOrderByIdAdmin } from "@/features/orders/services/order-admin";
import { MarkOrderPaidButton, OrderStatusForm } from "@/features/orders/components/order-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatBDT, formatDate } from "@/lib/format";

const PAYMENT_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  PAID: "default",
  FAILED: "destructive",
};

const PAYMENT_LABEL: Record<string, string> = {
  "cash-on-delivery": "Cash on delivery",
  bkash: "bKash",
  sslcommerz: "SSLCommerz",
};

const DELIVERY_LABEL: Record<string, string> = {
  dhaka: "Inside Dhaka",
  "outside-dhaka": "Outside Dhaka",
};

/** bKash/SSLCommerz settle off-site until a real gateway is wired in, so only those methods get a manual "mark as paid" control — cash on delivery is confirmed by the courier, not the admin panel. */
const MANUALLY_CONFIRMABLE_PAYMENTS = new Set(["bkash", "sslcommerz"]);

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getOrderByIdAdmin(id);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{order.reference}</h1>
          <Badge variant={PAYMENT_VARIANT[order.paymentStatus] ?? "outline"}>
            {PAYMENT_LABEL[order.payment] ?? order.payment} · {order.paymentStatus}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Placed {formatDate(order.createdAt)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Items
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="py-2 font-medium">Product</th>
                      <th className="py-2 font-medium">Model</th>
                      <th className="py-2 font-medium">Unit price</th>
                      <th className="py-2 font-medium">Qty</th>
                      <th className="py-2 text-right font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3">{item.productName}</td>
                        <td className="py-3 text-muted-foreground">{item.modelNumber}</td>
                        <td className="py-3">{formatBDT(item.unitPrice)}</td>
                        <td className="py-3">{item.quantity}</td>
                        <td className="py-3 text-right font-medium">
                          {formatBDT(item.unitPrice * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <dl className="mt-5 ml-auto max-w-64 space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatBDT(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Delivery ({DELIVERY_LABEL[order.delivery] ?? order.delivery})
                  </dt>
                  <dd>{formatBDT(order.deliveryFee)}</dd>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="text-primary">{formatBDT(order.total)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Order notes
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Fulfilment status
              </h2>
              <OrderStatusForm orderId={order.id} status={order.status} />

              {MANUALLY_CONFIRMABLE_PAYMENTS.has(order.payment) && order.paymentStatus === "PENDING" && (
                <>
                  <h2 className="pt-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Payment
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Confirm receipt outside the site, then mark this order as paid.
                  </p>
                  <MarkOrderPaidButton orderId={order.id} />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6 text-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Customer
              </h2>
              <p className="font-medium">
                {order.firstName} {order.lastName}
              </p>
              {order.company && <p className="text-muted-foreground">{order.company}</p>}
              <p className="text-muted-foreground">{order.phone}</p>
              <p className="text-muted-foreground">{order.email}</p>
              {order.user && (
                <p className="text-xs text-muted-foreground">Signed in as {order.user.email}</p>
              )}

              <div className="border-t pt-3">
                <p>{order.address}</p>
                <p className="text-muted-foreground">
                  {order.city}, {order.district} {order.postcode}
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getOrderForUser } from "@/features/account/services/orders";
import { formatBDT, formatDate } from "@/lib/format";
import { requireSession } from "@/lib/require-session";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  PROCESSING: "default",
  FULFILLED: "outline",
  CANCELLED: "destructive",
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

export default async function AccountOrderDetailPage({
  params,
}: PageProps<"/account/orders/[id]">) {
  const session = await requireSession();
  const { id } = await params;
  const order = await getOrderForUser(session.user.id, id);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to orders
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">{order.reference}</h2>
          <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>{order.status}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Placed {formatDate(order.createdAt)}</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Items
          </h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 font-medium">Product</th>
                  <th className="py-2 font-medium">Unit price</th>
                  <th className="py-2 font-medium">Qty</th>
                  <th className="py-2 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">{item.productName}</td>
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

          <p className="mt-5 border-t pt-4 text-sm text-muted-foreground">
            Paying by {PAYMENT_LABEL[order.payment] ?? order.payment}
            {order.paymentStatus === "PENDING" &&
              order.payment !== "cash-on-delivery" &&
              " — awaiting payment confirmation"}
            {order.paymentStatus === "PAID" && " — payment received"}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-1 p-6 text-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Delivery address
          </h3>
          <p className="mt-2">
            {order.firstName} {order.lastName}
          </p>
          {order.company && <p className="text-muted-foreground">{order.company}</p>}
          <p className="text-muted-foreground">{order.phone}</p>
          <p>{order.address}</p>
          <p className="text-muted-foreground">
            {order.city}, {order.district} {order.postcode}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

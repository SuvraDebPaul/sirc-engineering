import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { listOrdersAdmin } from "@/features/orders/services/order-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatBDT, formatDate } from "@/lib/format";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  PROCESSING: "default",
  FULFILLED: "outline",
  CANCELLED: "destructive",
};

const PAYMENT_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  PAID: "default",
  FAILED: "destructive",
};

export default async function AdminOrdersPage() {
  const orders = await listOrdersAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and fulfil orders as customers place them.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders yet"
          description="Orders placed at checkout will appear here."
        />
      ) : (
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-2 font-medium">Reference</th>
                    <th className="px-6 py-2 font-medium">Customer</th>
                    <th className="px-6 py-2 font-medium">Total</th>
                    <th className="px-6 py-2 font-medium">Payment</th>
                    <th className="px-6 py-2 font-medium">Status</th>
                    <th className="px-6 py-2 font-medium">Placed</th>
                    <th className="px-6 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3 font-mono text-xs">{order.reference}</td>
                      <td className="px-6 py-3">
                        <p className="font-medium">
                          {order.firstName} {order.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.phone}</p>
                      </td>
                      <td className="px-6 py-3 font-semibold">{formatBDT(order.total)}</td>
                      <td className="px-6 py-3">
                        <Badge variant={PAYMENT_VARIANT[order.paymentStatus] ?? "outline"}>
                          {order.payment} · {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>{order.status}</Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-3 text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/orders/${order.id}`}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

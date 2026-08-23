import Link from "next/link";
import { Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { listOrdersForUser } from "@/features/account/services/orders";
import { formatBDT, formatDate } from "@/lib/format";
import { requireSession } from "@/lib/require-session";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDING: "secondary",
  PROCESSING: "default",
  FULFILLED: "outline",
  CANCELLED: "destructive",
};

export default async function AccountOrdersPage() {
  const session = await requireSession();
  const orders = await listOrdersForUser(session.user.id);

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Orders you place will show up here."
        actions={
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            Browse products
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your orders</h2>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/account/orders/${order.id}`}>
            <Card className="transition-colors hover:border-primary">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{order.reference}</p>
                  <p className="mt-1 text-sm">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"} ·{" "}
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatBDT(order.total)}</span>
                  <Badge variant={STATUS_VARIANT[order.status] ?? "outline"}>{order.status}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

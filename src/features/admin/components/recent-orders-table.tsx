import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RecentOrder {
  reference: string;
  customer: string;
  date: string;
  status: "Pending" | "Processing" | "Fulfilled" | "Cancelled";
  total: string;
}

const STATUS_VARIANT: Record<
  RecentOrder["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  Pending: "outline",
  Processing: "secondary",
  Fulfilled: "default",
  Cancelled: "destructive",
};

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent orders</CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-6 py-2 font-medium">Reference</th>
                <th className="px-6 py-2 font-medium">Customer</th>
                <th className="px-6 py-2 font-medium">Date</th>
                <th className="px-6 py-2 font-medium">Status</th>
                <th className="px-6 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.reference} className="hover:bg-muted/40">
                  <td className="px-6 py-3 font-mono text-xs">{order.reference}</td>
                  <td className="px-6 py-3">{order.customer}</td>
                  <td className="px-6 py-3 text-muted-foreground">{order.date}</td>
                  <td className="px-6 py-3">
                    <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
                  </td>
                  <td className="px-6 py-3 text-right font-medium">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

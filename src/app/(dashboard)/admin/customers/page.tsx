import Link from "next/link";
import { Users } from "lucide-react";

import { listCustomersAdmin } from "@/features/account/services/customer-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatBDT, formatDate } from "@/lib/format";

export default async function AdminCustomersPage() {
  const customers = await listCustomersAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View customer accounts, order history and contact details.
        </p>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Accounts created at checkout or sign-up will appear here."
        />
      ) : (
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-2 font-medium">Customer</th>
                    <th className="px-6 py-2 font-medium">Orders</th>
                    <th className="px-6 py-2 font-medium">Total spent</th>
                    <th className="px-6 py-2 font-medium">Joined</th>
                    <th className="px-6 py-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <p className="font-medium">{customer.name}</p>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {customer.email}
                          {!customer.emailVerified && (
                            <Badge variant="outline" className="text-[10px]">
                              Unverified
                            </Badge>
                          )}
                        </p>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{customer.orderCount}</td>
                      <td className="px-6 py-3 font-semibold">{formatBDT(customer.totalSpent)}</td>
                      <td className="px-6 py-3 text-muted-foreground">{formatDate(customer.createdAt)}</td>
                      <td className="px-6 py-3 text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/customers/${customer.id}`}>View</Link>
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

import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

import { StatCard } from "@/features/admin/components/stat-card";
import { RecentOrdersTable } from "@/features/admin/components/recent-orders-table";
import { getDashboardStats, getRecentOrders } from "@/features/admin/services/dashboard";

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([getDashboardStats(), getRecentOrders()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">An overview of the store.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue (30d)"
          value={stats.revenue.value}
          change={stats.revenue.change}
          icon={DollarSign}
        />
        <StatCard
          label="Orders (30d)"
          value={stats.orders.value}
          change={stats.orders.change}
          icon={ShoppingCart}
        />
        <StatCard
          label="Customers"
          value={stats.customers.value}
          change={stats.customers.change}
          icon={Users}
        />
        <StatCard label="Products" value={stats.products.value} icon={Package} />
      </div>

      <RecentOrdersTable orders={recentOrders} />
    </div>
  );
}

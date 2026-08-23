import { prisma } from "@/lib/db/prisma";
import { formatBDT, formatDate } from "@/lib/format";
import type { RecentOrder } from "@/features/admin/components/recent-orders-table";

const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_LABELS: Record<string, RecentOrder["status"]> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

/** Percent change vs. the prior period. `undefined` when there's nothing to compare against yet. */
const percentChange = (current: number, previous: number): number | undefined => {
  if (previous === 0) return undefined;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

export interface DashboardStats {
  revenue: { value: string; change?: number };
  orders: { value: string; change?: number };
  customers: { value: string; change?: number };
  products: { value: string };
}

/**
 * Home-page dashboard figures.
 *
 * "Revenue" and "Orders" compare the last 30 days against the 30 days before
 * that. "Customers" compares new signups in the last 30 days against the
 * customer count that existed before the period, since a raw customer total
 * has nothing period-over-period to measure against.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const periodStart = new Date(now.getTime() - 30 * DAY_MS);
  const previousPeriodStart = new Date(now.getTime() - 60 * DAY_MS);

  const [
    currentOrders,
    previousOrders,
    currentRevenue,
    previousRevenue,
    totalCustomers,
    newCustomers,
    customersBeforePeriod,
    totalProducts,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: periodStart } } }),
    prisma.order.count({
      where: { createdAt: { gte: previousPeriodStart, lt: periodStart } },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: periodStart }, status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: previousPeriodStart, lt: periodStart },
        status: { not: "CANCELLED" },
      },
      _sum: { total: true },
    }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.user.count({ where: { role: "customer", createdAt: { gte: periodStart } } }),
    prisma.user.count({ where: { role: "customer", createdAt: { lt: periodStart } } }),
    prisma.product.count(),
  ]);

  return {
    revenue: {
      value: formatBDT(currentRevenue._sum.total ?? 0),
      change: percentChange(currentRevenue._sum.total ?? 0, previousRevenue._sum.total ?? 0),
    },
    orders: {
      value: String(currentOrders),
      change: percentChange(currentOrders, previousOrders),
    },
    customers: {
      value: String(totalCustomers),
      change: percentChange(newCustomers, customersBeforePeriod),
    },
    products: { value: String(totalProducts) },
  };
}

export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: true },
  });

  return orders.map((order) => ({
    reference: order.reference,
    customer: order.user?.name ?? (order.company || `${order.firstName} ${order.lastName}`),
    date: formatDate(order.createdAt),
    status: STATUS_LABELS[order.status] ?? "Pending",
    total: formatBDT(order.total),
  }));
}

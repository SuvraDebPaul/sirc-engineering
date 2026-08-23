import { prisma } from "@/lib/db/prisma";

export async function listCustomersAdmin() {
  const users = await prisma.user.findMany({
    where: { role: "customer" },
    include: { orders: { select: { total: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => {
    const orders = user.orders.filter((order) => order.status !== "CANCELLED");
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      orderCount: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    };
  });
}

export async function getCustomerByIdAdmin(id: string) {
  const user = await prisma.user.findUnique({
    where: { id, role: "customer" },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
      addresses: { orderBy: { isDefault: "desc" } },
    },
  });
  if (!user) return null;

  const activeOrders = user.orders.filter((order) => order.status !== "CANCELLED");

  return {
    ...user,
    orderCount: activeOrders.length,
    totalSpent: activeOrders.reduce((sum, order) => sum + order.total, 0),
  };
}

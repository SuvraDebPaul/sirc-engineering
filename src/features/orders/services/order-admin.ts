import { prisma } from "@/lib/db/prisma";

export async function listOrdersAdmin() {
  return prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderByIdAdmin(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true },
  });
}

export async function updateOrderStatus(id: string, status: string) {
  return prisma.order.update({ where: { id }, data: { status } });
}

export async function markOrderPaid(id: string) {
  return prisma.order.update({ where: { id }, data: { paymentStatus: "PAID" } });
}

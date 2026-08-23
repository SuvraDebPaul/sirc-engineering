import { prisma } from "@/lib/db/prisma";

export type StaffRole = "admin" | "manager";
export type AssignableRole = StaffRole | "customer";

export async function listStaffAdmin() {
  return prisma.user.findMany({
    where: { role: { in: ["admin", "manager"] } },
    orderBy: { createdAt: "asc" },
  });
}

export async function findUserByEmailAdmin(email: string) {
  return prisma.user.findFirst({ where: { email: { equals: email.trim(), mode: "insensitive" } } });
}

export async function setUserRole(id: string, role: AssignableRole) {
  return prisma.user.update({ where: { id }, data: { role } });
}

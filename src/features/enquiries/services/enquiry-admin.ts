import { prisma } from "@/lib/db/prisma";

export async function listEnquiriesAdmin(status: "NEW" | "RESPONDED" | "CLOSED" | "ALL" = "NEW") {
  return prisma.enquiry.findMany({
    where: status === "ALL" ? {} : { status },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateEnquiryStatus(id: string, status: "NEW" | "RESPONDED" | "CLOSED") {
  return prisma.enquiry.update({ where: { id }, data: { status } });
}

export async function deleteEnquiry(id: string) {
  return prisma.enquiry.delete({ where: { id } });
}

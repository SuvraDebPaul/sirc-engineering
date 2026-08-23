import { prisma } from "@/lib/db/prisma";

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

/** Scoped to the owner — the same guard as orders, for the same reason. */
export async function getAddressForUser(userId: string, addressId: string) {
  return prisma.address.findFirst({ where: { id: addressId, userId } });
}

export interface AddressWriteData {
  label: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postcode: string;
}

/**
 * The first address a customer ever saves becomes their default automatically
 * — nobody should have to remember to flip a switch to get the address they
 * just entered pre-filled next time.
 */
export async function createAddress(userId: string, data: AddressWriteData) {
  const existing = await prisma.address.count({ where: { userId } });
  return prisma.address.create({
    data: { ...data, userId, isDefault: existing === 0 },
  });
}

export async function updateAddress(id: string, data: AddressWriteData) {
  return prisma.address.update({ where: { id }, data });
}

export async function deleteAddress(id: string) {
  return prisma.address.delete({ where: { id } });
}

/** Unsets every other address for this user first — exactly one default at a time. */
export async function setDefaultAddress(userId: string, addressId: string) {
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);
}

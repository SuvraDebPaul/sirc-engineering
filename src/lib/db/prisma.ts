import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../generated/prisma/client";

const globalPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

/**
 * Set `PRISMA_LOG_QUERIES=1` to print every statement this process sends.
 *
 * Worth keeping: the reason this app twice exhausted a database plan was
 * that nothing showed how many queries a single page view actually cost.
 * With caching in place a warm public page should log none at all, so this
 * is the fastest way to catch a new uncached read before it ships.
 */
const logQueries = process.env.PRISMA_LOG_QUERIES === "1";

const createClient = () => {
  const client = new PrismaClient({ adapter });
  if (!logQueries) return client;

  // A client extension rather than `log: ["query"]`: with a driver adapter
  // the query event does not fire, but every operation still passes through
  // here. One line per operation, so a page that logs nothing is genuinely
  // being served from cache.
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          console.log(`[prisma] ${model}.${operation}`);
          return query(args);
        },
      },
    },
  }) as unknown as PrismaClient;
};

export const prisma = globalPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalPrisma.prisma = prisma;
}

export { Prisma } from "../../../generated/prisma/client";

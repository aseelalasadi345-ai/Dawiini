import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Pooled connection for the app's runtime queries (API routes, server
// components) — distinct from DIRECT_URL, which prisma7.config.ts uses for
// migrations/db push and needs a non-pooled connection.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Reused across hot-reloads in dev so `next dev` doesn't open a fresh
// connection pool on every file save; in production each server instance
// just gets its own singleton.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

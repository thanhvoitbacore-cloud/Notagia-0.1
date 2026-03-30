import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_LF2uW4AHlhbE@ep-tiny-brook-amzz1gzr-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";
  const adapter = new PrismaNeon({ connectionString } as any);
  return new PrismaClient({ adapter: adapter as any });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

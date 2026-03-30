import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import "dotenv/config";

async function main() {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    const adapter = new PrismaNeon(pool as any); // using Pool
    const prisma = new PrismaClient({ adapter: adapter as any });
    const user = await prisma.user.findFirst();
    console.log("Success! Users:", user);
    process.exit(0);
  } catch (err: any) {
    console.error("Failed with pooling:", err.message);
    try {
      const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! } as any); // using Config
      const prisma = new PrismaClient({ adapter });
      const user = await prisma.user.findFirst();
      console.log("Success with config! Users:", user);
      process.exit(0);
    } catch (err2: any) {
      console.error("Failed with config:", err2.message);
      process.exit(1);
    }
  }
}
main();

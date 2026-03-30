import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Success! Users found:", users.length);
    process.exit(0);
  } catch (error: any) {
    console.error("Failed to connect via singleton:", error.message);
    process.exit(1);
  }
}
main();

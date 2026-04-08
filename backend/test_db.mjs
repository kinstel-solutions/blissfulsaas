import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("SUCCESS: Tables exist! Users count:", users.length);
  } catch (error) {
    console.error("FAIL: Error fetching from database:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

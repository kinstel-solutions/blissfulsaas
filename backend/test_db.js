const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("SUCCESS! Database connection working. Users:", users.length);
  } catch (error) {
    if (error.message.includes('does not exist')) {
       console.log("FAIL: The table 'User' does not exist! Schema push failed.");
    } else {
       console.log("FAIL: Other error - ", error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();

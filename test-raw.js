const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const notifResult = await prisma.$runCommandRaw({
    find: "Notification",
    filter: {
      type: "SYSTEM",
      title: "Agent Assignment Request",
      readAt: null,
    },
    limit: 5,
  });
  console.log("Raw match:", notifResult.cursor.firstBatch.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());

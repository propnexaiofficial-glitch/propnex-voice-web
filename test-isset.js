const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const withNull = await prisma.notification.findMany({
      where: { readAt: null }
    });
    console.log("With readAt: null ->", withNull.length);

    const withIsSet = await prisma.notification.findMany({
      where: { readAt: { isSet: false } }
    });
    console.log("With readAt: { isSet: false } ->", withIsSet.length);
  } catch (err) {
    console.error("Error:", err);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

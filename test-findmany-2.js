const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, company: true },
      take: 2
    });
    console.log("Found:", notifications.length);
    console.log(JSON.stringify(notifications, null, 2));
  } catch (err) {
    console.error("Error in findMany:", err);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

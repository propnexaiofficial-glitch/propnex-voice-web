const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        readAt: null,
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: true,
        company: true
      }
    });
    console.log("Success! Notifications length:", notifications.length);
  } catch (err) {
    console.error("Error in findMany:", err);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const notifs = await prisma.notification.findMany({
    where: { title: 'Agent Assignment Request' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(notifs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());

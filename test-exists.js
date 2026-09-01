const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const notifs = await prisma.notification.findMany({
    where: { title: 'Agent Assignment Request' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  for (const n of notifs) {
    const user = await prisma.user.findUnique({ where: { id: n.userId } });
    const company = await prisma.company.findUnique({ where: { id: n.companyId } });
    console.log("Notification ID:", n.id);
    console.log("User exists:", !!user);
    console.log("Company exists:", !!company);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

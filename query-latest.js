const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const calls = await prisma.callLog.findMany({
    where: { provider: 'BONVOICE' },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log(JSON.stringify(calls, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

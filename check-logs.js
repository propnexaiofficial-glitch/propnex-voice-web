const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.callLog.findMany({
    where: { correlationId: { startsWith: 'reactivation-2026-09-19-' } },
    select: { id: true, correlationId: true, status: true, startedAt: true }
  });
  console.log(logs);
}

main().catch(console.error).finally(() => prisma.$disconnect());

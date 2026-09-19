const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.callLog.deleteMany({
    where: { correlationId: { startsWith: 'reactivation-2026-09-19-' } }
  });
  console.log('Deleted:', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());

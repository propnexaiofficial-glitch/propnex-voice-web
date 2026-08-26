const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.callLog.updateMany({
    where: { status: 'PENDING', direction: 'OUTBOUND' },
    data: { status: 'FAILED', durationSeconds: 0 }
  });
  console.log('Fixed', result.count, 'pending calls to failed.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
